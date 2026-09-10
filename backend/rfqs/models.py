from django.db import models
from django.conf import settings

class RFQ(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('AWARDED', 'Awarded'),
    )
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rfqs')
    product_name = models.CharField(max_length=255)
    description = models.TextField()
    quantity = models.IntegerField(default=1)
    unit = models.CharField(max_length=50, default='pcs')
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_location = models.CharField(max_length=255)
    required_delivery_date = models.DateField()
    closing_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_name} - {self.buyer.username}"
