from django.db import models
from django.conf import settings
from rfqs.models import RFQ

class Quotation(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    )
    rfq = models.ForeignKey(RFQ, on_delete=models.CASCADE, related_name='quotations')
    supplier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quotations')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_time = models.CharField(max_length=100)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quotation for {self.rfq.product_name} by {self.supplier.username}"
