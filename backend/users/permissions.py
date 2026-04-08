from rest_framework.permissions import BasePermission, OperationHolderMixin

class IsStudent(OperationHolderMixin, BasePermission):
    """Allows access only to users with the STUDENT role."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'STUDENT'
        )

class IsNurse(OperationHolderMixin, BasePermission):
    """Allows access only to users with the NURSE role."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'NURSE'
        )

class IsSecurity(OperationHolderMixin, BasePermission):
    """Allows access only to users with the SECURITY role."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'SECURITY'
        )

class IsCounselor(OperationHolderMixin, BasePermission):
    """Allows access only to users with the COUNSELOR role."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'COUNSELOR'
        )

class IsAdminRole(OperationHolderMixin, BasePermission):
    """Allows access only to users with the ADMIN role."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )
