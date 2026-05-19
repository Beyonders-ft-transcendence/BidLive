ROLE_VISITOR = "VISITOR"
ROLE_PERSONAL_USER = "PERSONAL_USER"
ROLE_BUSINESS_USER = "BUSINESS_USER"
ROLE_SUPER_ADMIN = "SUPER_ADMIN"

DEFAULT_SIGNUP_ROLE = ROLE_PERSONAL_USER

SYSTEM_PERMISSIONS = [
    ("auction.create", "Create auctions"),
    ("auction.read", "View auctions"),
    ("auction.update", "Update auctions"),
    ("auction.delete", "Delete auctions"),
    ("auction.bid", "Place bids on auctions"),
    ("chat.send", "Send chat messages"),
    ("chat.delete", "Delete chat messages"),
    ("report.create", "Create content reports"),
    ("report.review", "Review content reports"),
    ("user.read", "Read user records"),
    ("user.create", "Create user records"),
    ("user.update", "Update user records"),
    ("user.delete", "Delete user records"),
    ("user.ban", "Ban or suspend users"),
    ("role.manage", "Manage roles"),
    ("permission.manage", "Manage permissions"),
]

ROLE_PERMISSIONS = {
    ROLE_VISITOR: [
        "auction.read",
    ],
    ROLE_PERSONAL_USER: [
        "auction.create",
        "auction.read",
        "auction.update",
        "auction.bid",
        "chat.send",
        "report.create",
        "user.update",
    ],
    ROLE_BUSINESS_USER: [
        "auction.create",
        "auction.read",
        "auction.update",
        "auction.delete",
        "auction.bid",
        "chat.send",
        "chat.delete",
        "report.create",
        "user.update",
    ],
    ROLE_SUPER_ADMIN: [name for name, _ in SYSTEM_PERMISSIONS],
}
