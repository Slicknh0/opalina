import { Container } from "@/components/ui/container";
import { PlaceholderText } from "@/components/ui/placeholder-text";
import { clinic } from "@/content/clinic";
import { NAV_ITEMS } from "./nav-items";

export function Footer() {
  return (
    <footer className="border-t border-border pt-16 pb-28 md:pb-12">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-display text-[2.5rem] font-light leading-none tracking-[-0.02em]">
            {clinic.name}
          </p>
          <p className="mt-3 text-muted">
            {clinic.descriptor} nos {clinic.neighborhood}, {clinic.city}.
          </p>
        </div>

        <nav aria-label="Rodapé" className="lg:col-span-3">
          <ul className="space-y-2 text-[0.9375rem]">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <address className="space-y-2 text-[0.9375rem] not-italic lg:col-span-4">
          <p>
            <PlaceholderText value={clinic.address} />
          </p>
          <p>
            <PlaceholderText value={clinic.hours} />
          </p>
          <p>
            <PlaceholderText value={clinic.phone} />
          </p>
          <p>
            <PlaceholderText value={clinic.instagram} />
          </p>
        </address>

        <div className="space-y-3 border-t border-border pt-8 text-caption text-muted lg:col-span-12">
          <p>
            Responsável técnico:{" "}
            <PlaceholderText value={clinic.responsible.name} /> —{" "}
            <PlaceholderText value={clinic.responsible.cro} />
          </p>
          <p>
            Os dados enviados pelo formulário são usados apenas para retornar o
            seu contato, conforme a LGPD.
          </p>
          <p>
            Demonstração de portfólio. Opalina é uma clínica fictícia: dados de
            contato, profissional e avaliações são espaços reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
