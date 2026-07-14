from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Invoice, Asset, User
from app.schemas import InvoiceOut
from app.auth import get_current_user, require_admin
from app.services.storage import save_file, read_file, delete_file
from app.services.encryption import encrypt_bytes, decrypt_bytes

ALLOWED_TYPES = {"pdf", "jpg", "jpeg", "png"}
MAX_SIZE_BYTES = 10 * 1024 * 1024

router = APIRouter(tags=["invoices"])


@router.post("/assets/{asset_id}/invoices", response_model=InvoiceOut)
async def upload_invoice(
    asset_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    extension = file.filename.rsplit(".", 1)[-1].lower()
    if extension not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, and PNG files are allowed")

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit")

    encrypted_content = encrypt_bytes(content)
    file_path, _ = save_file(encrypted_content, file.filename)

    invoice = Invoice(
        asset_id=asset_id,
        file_name=file.filename,
        file_path=file_path,
        file_size=len(content),
        file_type=extension,
        uploaded_by=current_user.id,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return invoice


@router.get("/assets/{asset_id}/invoices", response_model=List[InvoiceOut])
def list_invoices(asset_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Invoice).filter(Invoice.asset_id == asset_id).all()


@router.get("/invoices/{invoice_id}/download")
def download_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    encrypted_content = read_file(invoice.file_path)
    decrypted_content = decrypt_bytes(encrypted_content)

    media_types = {"pdf": "application/pdf", "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png"}

    return Response(
        content=decrypted_content,
        media_type=media_types.get(invoice.file_type, "application/octet-stream"),
        headers={"Content-Disposition": f'inline; filename="{invoice.file_name}"'},
    )


@router.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    delete_file(invoice.file_path)
    db.delete(invoice)
    db.commit()

    return {"message": "Invoice deleted"}