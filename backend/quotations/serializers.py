from rest_framework import serializers
from .models import Quotation

class QuotationSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplier.full_name')
    supplier_email = serializers.ReadOnlyField(source='supplier.email')
    supplier_company = serializers.ReadOnlyField(source='supplier.full_name')
    rfq_title = serializers.ReadOnlyField(source='rfq.product_name')
    rfq_product_name = serializers.ReadOnlyField(source='rfq.product_name')
    buyer_name = serializers.ReadOnlyField(source='rfq.buyer.full_name')
    buyer_email = serializers.ReadOnlyField(source='rfq.buyer.email')

    quoted_price = serializers.DecimalField(source='price', max_digits=12, decimal_places=2, required=False)
    delivery_days = serializers.CharField(source='delivery_time', required=False)

    class Meta:
        model = Quotation
        fields = (
            'id',
            'rfq',
            'rfq_title',
            'rfq_product_name',
            'supplier',
            'supplier_name',
            'supplier_email',
            'supplier_company',
            'buyer_name',
            'buyer_email',
            'price',
            'quoted_price',
            'delivery_time',
            'delivery_days',
            'message',
            'status',
            'created_at',
        )
        read_only_fields = ('supplier', 'created_at')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['supplier'] = request.user
        return super().create(validated_data)
