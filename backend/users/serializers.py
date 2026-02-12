# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Used for viewing user profiles or returning data after login."""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class RegisterSerializer(serializers.ModelSerializer):
    """Used specifically for creating a new user account."""
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        # We use the manager's create_user to ensure password hashing
        return User.objects.create_user(**validated_data)

    def to_representation(self, instance):
        # Return user data and tokens after registration
        refresh = RefreshToken.for_user(instance)
        return {
            'user': UserSerializer(instance).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }