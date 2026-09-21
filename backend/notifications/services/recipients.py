# notifications/services/recipients.py
from django.contrib.auth import get_user_model

User = get_user_model()


def parents_in_organization(organization):
    """
    Every active parent whose membership is in `organization`.

    Adjust to match your model. Two common shapes:

    A) AUTH_USER_MODEL is Profile with a direct FK:
         return User.objects.filter(organization=organization, role="parent", is_active=True)

    B) Profile -> OrganizationMembership -> Organization:
         return User.objects.filter(
             organization__organization=organization,
             role="parent",
             is_active=True,
         ).distinct()
    """
    return User.objects.filter(
        organization__organization=organization,          # adjust per your model
        role__role_name="parent",
        is_active=True,
    ).distinct()


def teachers_in_organization(organization):
    return User.objects.filter(
        organization__organization=organization,
        role__role_name="teacher",
        is_active=True,
    ).distinct()


def admins_in_organization(organization):
    return User.objects.filter(
        organization__organization=organization,
        role__role_name__in=["admin", "staff"],
        is_active=True,
    ).distinct()
