ROLE_VISITOR = "VISITOR"
ROLE_USER = "USER"
ROLE_MONITOR = "MONITOR"
ROLE_SUPER_ADMIN = "SUPER_ADMIN"

SYSTEM_ROLE_NAMES = (
    ROLE_VISITOR,
    ROLE_USER,
    ROLE_MONITOR,
    ROLE_SUPER_ADMIN,
)

DEFAULT_SIGNUP_ROLE = ROLE_USER

SYSTEM_PERMISSIONS = [
    ("auction.create", "Create auctions"),
    ("auction.read", "View auctions"),
    ("auction.update", "Update auctions"),
    ("auction.delete", "Delete auctions"),
    ("auction.bid", "Place bids on auctions"),
    ("auction.buy_now", "Buy auction items immediately"),
    ("auction.cancel", "Cancel auctions"),
    ("auction.watch", "Watch/favourite auctions"),
    ("auction.manage", "Moderate and manage auctions"),
    ("chat.send", "Send chat messages"),
    ("chat.delete", "Delete chat messages"),
    ("chat.moderate", "Moderate chat messages"),
    ("report.create", "Create content reports"),
    ("report.review", "Review content reports"),
    ("report.resolve", "Resolve content reports"),
    ("user.read", "Read user records"),
    ("user.create", "Create user records"),
    ("user.update", "Update user records"),
    ("user.delete", "Delete user records"),
    ("user.ban", "Ban or suspend users"),
    ("user.manage", "Manage user accounts"),
    ("user.promote", "Promote user roles"),
    ("role.manage", "Manage roles"),
    ("permission.manage", "Manage permissions"),
    ("content.hide", "Hide suspicious content"),
    ("content.remove", "Remove suspicious content"),
    ("moderation.alert", "Issue moderation alerts"),
    ("audit.read", "Read audit logs"),
    ("audit.global", "Read global audit logs"),
    ("system.configure", "Configure critical system settings"),
    ("analytics.global", "Read global analytics"),
]

ROLE_PERMISSIONS = {
    ROLE_VISITOR: [
        "auction.read",
    ],
    ROLE_USER: [
        "auction.create",
        "auction.read",
        "auction.update",
        "auction.delete",
        "auction.bid",
        "auction.buy_now",
        "auction.watch",
        "chat.send",
        "report.create",
        "user.read",
        "user.update",
    ],
    ROLE_MONITOR: [
        "auction.create",
        "auction.read",
        "auction.update",
        "auction.delete",
        "auction.bid",
        "auction.buy_now",
        "auction.cancel",
        "auction.watch",
        "auction.manage",
        "chat.send",
        "chat.delete",
        "chat.moderate",
        "report.create",
        "report.review",
        "report.resolve",
        "user.read",
        "user.update",
        "user.ban",
        "content.hide",
        "content.remove",
        "moderation.alert",
    ],
    ROLE_SUPER_ADMIN: [name for name, _ in SYSTEM_PERMISSIONS],
}
