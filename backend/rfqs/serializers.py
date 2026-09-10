from rest_framework import serializers
from .models import RFQ
from accounts.serializers import UserSerializer

class RFQSerializer(serializers.ModelSerializer):
    buyer_name = serializers.ReadOnlyField(source='buyer.full_name')
    buyer_email = serializers.ReadOnlyField(source='buyer.email')
    quotations_count = serializers.SerializerMethodField()
    title = serializers.CharField(source='product_name', required=False)

    class Meta:
        model = RFQ
        fields = (
            'id',
            'buyer',
            'buyer_name',
            'buyer_email',
            'product_name',
            'title',
            'description',
            'quantity',
            'unit',
            'budget',
            'delivery_location',
            'required_delivery_date',
            'closing_date',
            'status',
            'quotations_count',
            'created_at',
        )
        read_only_fields = ('buyer', 'created_at')

    def get_quotations_count(self, obj):
        return obj.quotations.count()

    def create(self, validated_data):
        # Assign current authenticated user as buyer
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['buyer'] = request.user
        return super().create(validated_data)
