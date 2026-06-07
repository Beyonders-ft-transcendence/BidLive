from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.users.seed.demo_data import DEFAULT_DEMO_PASSWORD, DEMO_EMAIL_DOMAIN, DEMO_USERS
from apps.users.seed.seed_service import clear_demo_data, demo_users_exist, seed_demo_data


class Command(BaseCommand):
    help = "Popula o banco com usuarios, leiloes, streams e dados demo para desenvolvimento."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Remove todos os dados demo (@bidlive.dev).",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Recria os dados demo mesmo se ja existirem.",
        )
        parser.add_argument(
            "--password",
            default=DEFAULT_DEMO_PASSWORD,
            help=f"Senha dos usuarios demo (padrao: {DEFAULT_DEMO_PASSWORD}).",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            counts = clear_demo_data()
            if not counts:
                self.stdout.write(self.style.WARNING("Nenhum dado demo encontrado para remover."))
                return
            self.stdout.write(self.style.SUCCESS("Dados demo removidos:"))
            for label, total in counts.items():
                self.stdout.write(f"  - {label}: {total}")
            return

        if not settings.DEBUG and not options["force"]:
            raise CommandError("Seed demo so pode rodar com DEBUG=True. Use --force para ignorar.")

        if demo_users_exist() and not options["force"]:
            self.stdout.write(
                self.style.WARNING(
                    "Dados demo ja existem. Use --force para recriar ou --clear para remover."
                )
            )
            self._print_credentials(options["password"])
            return

        if options["force"] and demo_users_exist():
            clear_demo_data()

        result = seed_demo_data(password=options["password"])
        self.stdout.write(self.style.SUCCESS("Seed demo concluido:"))
        self.stdout.write(f"  - usuarios: {result['users']}")
        self.stdout.write(f"  - leiloes novos: {result['auctions']}")
        self.stdout.write(f"  - dominios novos: {result['domains']}")
        self.stdout.write(f"  - amizades novas: {result['friendships']}")
        self.stdout.write(f"  - notificacoes novas: {result['notifications']}")
        self.stdout.write(f"  - mensagens de chat novas: {result['messages']}")
        self.stdout.write(f"  - reports novos: {result['reports']}")
        self.stdout.write(f"  - eventos analytics novos: {result['analytics_events']}")
        self._print_credentials(options["password"])

    def _print_credentials(self, password: str) -> None:
        self.stdout.write("")
        self.stdout.write(self.style.NOTICE(f"Contas demo (@{DEMO_EMAIL_DOMAIN}):"))
        for spec in DEMO_USERS:
            roles = ", ".join(spec.extra_roles) if spec.extra_roles else "USER"
            self.stdout.write(f"  - {spec.email} ({roles}) senha: {password}")
        self.stdout.write("")
        self.stdout.write("Login: POST /api/auth/login/ com email e password.")
