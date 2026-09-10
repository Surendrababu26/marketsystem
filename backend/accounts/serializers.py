from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'role', 'password', 'confirm_password')

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        email = validated_data.get('email')
        username = validated_data.get('username') or email
        password = validated_data.pop('password')
        role = (validated_data.get('role') or 'buyer').lower()
        full_name = validated_data.get('full_name', '')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            full_name=full_name
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'role')
