"use client";

import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { clinic } from "@/content/clinic";
import {
  type BookingErrors,
  type BookingInput,
  composeBookingMessage,
  MESSAGE_MAX,
  validateBooking,
} from "@/lib/booking";
import { cn } from "@/lib/cn";
import { resolveBookingTarget } from "@/lib/contact";

type Status = "idle" | "invalid" | "sent" | "not-configured";

const EMPTY: BookingInput = { name: "", phone: "", treatment: "", message: "" };
const FIELD_ORDER: (keyof BookingInput)[] = [
  "name",
  "phone",
  "treatment",
  "message",
];

const fieldClass =
  "mt-2 block min-h-12 w-full rounded-none border-0 border-b border-foreground/55 bg-transparent px-0 py-2 text-[1.0625rem] transition-colors duration-(--duration-ui) placeholder:text-muted focus:border-accent focus:outline-none focus-visible:outline-none aria-invalid:border-error";

export function BookingForm() {
  const id = useId();
  const [values, setValues] = useState<BookingInput>(EMPTY);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const [invalidAttempt, setInvalidAttempt] = useState(0);
  const options = clinic.bookingOptions;

  // Focus the first invalid field only after React has rendered aria-invalid
  // and the error text, so assistive tech announces the problem with the field.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per failed submit
  useEffect(() => {
    if (invalidAttempt === 0) return;
    const first = FIELD_ORDER.find((f) => errors[f]);
    formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }, [invalidAttempt]);

  const update = (field: keyof BookingInput, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    setStatus("idle");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = validateBooking(
      values,
      options.map((o) => o.id),
    );
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("invalid");
      setInvalidAttempt((n) => n + 1);
      return;
    }

    const label =
      options.find((o) => o.id === result.data.treatment)?.label ?? "";
    const target = resolveBookingTarget(
      clinic.whatsapp,
      composeBookingMessage(result.data, label),
    );
    if (target.kind === "not-configured") {
      setStatus("not-configured");
      return;
    }
    // Opened synchronously, inside the submit gesture, so browsers allow it.
    window.open(target.url, "_blank", "noopener,noreferrer");
    setStatus("sent");
  };

  const errorId = (field: keyof BookingInput) => `${id}-${field}-erro`;
  const described = (field: keyof BookingInput, extra?: string) =>
    [errors[field] ? errorId(field) : null, extra].filter(Boolean).join(" ") ||
    undefined;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} className="space-y-8">
      <div>
        <label htmlFor={`${id}-name`} className="text-[0.9375rem]">
          Nome
        </label>
        <input
          id={`${id}-name`}
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={described("name")}
          className={fieldClass}
        />
        <FieldError id={errorId("name")} message={errors.name} />
      </div>

      <div>
        <label htmlFor={`${id}-phone`} className="text-[0.9375rem]">
          WhatsApp com DDD
        </label>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 90000-0000"
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={described("phone")}
          className={fieldClass}
        />
        <FieldError id={errorId("phone")} message={errors.phone} />
      </div>

      <div>
        <label htmlFor={`${id}-treatment`} className="text-[0.9375rem]">
          Tratamento de interesse
        </label>
        <div className="relative">
          <select
            id={`${id}-treatment`}
            name="treatment"
            value={values.treatment}
            onChange={(e) => update("treatment", e.target.value)}
            aria-invalid={Boolean(errors.treatment)}
            aria-describedby={described("treatment")}
            className={cn(fieldClass, "appearance-none pr-8")}
          >
            <option value="" disabled>
              Selecione
            </option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-1 bottom-4 size-2 rotate-45 border-r border-b border-foreground/60"
          />
        </div>
        <FieldError id={errorId("treatment")} message={errors.treatment} />
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="text-[0.9375rem]">
          Mensagem <span className="text-muted">(opcional)</span>
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={3}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={described("message", `${id}-contador`)}
          className={cn(fieldClass, "resize-y")}
        />
        <div className="mt-2 flex justify-between gap-4">
          <FieldError id={errorId("message")} message={errors.message} />
          <p
            id={`${id}-contador`}
            className={cn(
              "ml-auto text-caption tabular-nums",
              values.message.length > MESSAGE_MAX ? "text-error" : "text-muted",
            )}
          >
            {values.message.length}/{MESSAGE_MAX}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Button type="submit" className="w-full sm:w-auto">
          Enviar pelo WhatsApp
        </Button>
        <p className="max-w-[52ch] text-caption text-muted">
          Usamos seus dados apenas para retornar o contato. Não envie
          informações de saúde por aqui.
        </p>
        <output className="block min-h-[1lh] text-[0.9375rem]">
          {status === "invalid" && (
            <span className="text-error">
              Revise os campos indicados para enviar.
            </span>
          )}
          {status === "sent" &&
            "Abrimos o WhatsApp com a sua mensagem. É só enviar por lá."}
          {status === "not-configured" && (
            <span className="text-accent">
              Demonstração: configure o número de WhatsApp da clínica para
              ativar o envio.
            </span>
          )}
        </output>
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-[0.9375rem] text-error">
      {message}
    </p>
  );
}
