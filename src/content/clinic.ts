import { type Maybe, placeholder } from "@/lib/placeholder";

/**
 * Single source of truth for the page's copy and clinic data.
 *
 * Opalina is a fictional clinic (portfolio demo). Every fact a real clinic
 * would have to prove — contact data, professional, credentials, reviews,
 * prices — is a `placeholder()` and renders as one. Replace them with real,
 * verified data before publishing for a real client.
 */

export type Treatment = {
  id: string;
  name: string;
  summary: string;
  indication: string;
  /** Agnes render: base path without the "-<width>.webp" suffix. */
  render: { src: string; alt: string };
};

export type FaqItem = { question: string; answer: Maybe<string> };

export type MethodStep = { title: string; body: string };

const treatments: Treatment[] = [
  {
    id: "lentes",
    name: "Lentes de contato dental",
    summary:
      "Lâminas finas de cerâmica aplicadas na frente dos dentes para ajustar cor, forma e proporção. Em muitos casos pedem pouco ou nenhum desgaste — isso é definido na avaliação.",
    indication:
      "Pequenas alterações de forma, espaços entre os dentes e manchas que não respondem ao clareamento.",
    render: {
      src: "/treatments/lentes",
      alt: "Ilustração 3D de um dente de vidro fosco com acabamento de porcelana perolada.",
    },
  },
  {
    id: "facetas",
    name: "Facetas em porcelana",
    summary:
      "Mais espessas que as lentes, corrigem alterações maiores de cor, formato e alinhamento, com a translucidez natural da cerâmica.",
    indication:
      "Dentes muito escurecidos, desgastados ou com restaurações antigas aparentes.",
    render: {
      src: "/treatments/facetas",
      alt: "Ilustração 3D de um dente com uma faceta de porcelana levemente destacada na borda.",
    },
  },
  {
    id: "clareamento",
    name: "Clareamento dental",
    summary:
      "Clareamento supervisionado, no consultório ou em casa com moldeiras sob medida, planejado para chegar a um tom que combine com você.",
    indication:
      "Dentes saudáveis que escureceram com o tempo, café, vinho ou tabaco.",
    render: {
      src: "/treatments/clareamento",
      alt: "Ilustração 3D de três dentes lado a lado, do tom marfim ao branco natural.",
    },
  },
  {
    id: "alinhadores",
    name: "Alinhadores transparentes",
    summary:
      "Placas removíveis e discretas que movimentam os dentes aos poucos, com cada etapa simulada no planejamento digital.",
    indication:
      "Dentes desalinhados, apinhados ou com pequenos espaços, em adultos e adolescentes.",
    render: {
      src: "/treatments/alinhadores",
      alt: "Ilustração 3D de um alinhador transparente sobre uma fileira de dentes de vidro.",
    },
  },
  {
    id: "gengiva",
    name: "Contorno gengival",
    summary:
      "Ajuste delicado da linha da gengiva para equilibrar a proporção entre dentes, lábios e sorriso.",
    indication:
      "Sorriso gengival, dentes que parecem curtos ou gengiva com contorno irregular.",
    render: {
      src: "/treatments/gengiva",
      alt: "Ilustração 3D de dois incisivos em uma gengiva esculpida em rosa suave, com contorno uniforme.",
    },
  },
  {
    id: "reabilitacao",
    name: "Reabilitação estética",
    summary:
      "Um plano combinado para devolver função e estética, com restaurações, coroas ou implantes quando indicados.",
    indication:
      "Perdas dentárias, desgastes extensos ou vários tratamentos antigos a refazer.",
    render: {
      src: "/tooth/implant",
      alt: "Ilustração 3D de um implante dentário: coroa de porcelana, pilar e parafuso.",
    },
  },
];

export const clinic = {
  name: "Opalina",
  descriptor: "Estúdio de odontologia estética",
  neighborhood: "Jardins",
  city: "São Paulo",
  state: "SP",

  address: placeholder("Endereço completo") as Maybe<string>,
  phone: placeholder("Telefone") as Maybe<string>,
  /** E.164 digits (e.g. 5511900000000) once the real number is known. */
  whatsapp: placeholder("WhatsApp") as Maybe<string>,
  hours: placeholder("Horário de atendimento") as Maybe<string>,
  mapsUrl: placeholder("Link do Google Maps") as Maybe<string>,
  instagram: placeholder("Instagram") as Maybe<string>,

  hero: {
    lead: "Estúdio de odontologia estética nos Jardins, em São Paulo.",
    title: "Estética dental com a naturalidade da luz.",
    body: "Lentes, facetas e clareamento planejados um a um, com atenção à cor, à forma e à proporção do seu rosto.",
    trust:
      "Cada sorriso é planejado individualmente, do estudo de cor ao ensaio digital.",
  },

  scene: {
    beats: {
      turn: {
        title: "A luz atravessa o esmalte.",
        body: "Um dente natural não é branco opaco: a borda é translúcida e a luz entra, reflete e volta com profundidade.",
      },
      layers: {
        title: "Naturalidade antes de brancura.",
        body: "Esmalte, dentina e polpa mudam a forma como cada dente reflete a luz. Por isso o planejamento começa pela observação, não pelo tom mais claro da escala.",
        labels: { enamel: "Esmalte", dentine: "Dentina", pulp: "Polpa" },
      },
      implant: {
        title: "Quando falta um dente, devolvemos forma e função.",
        body: "Coroas e implantes planejados para se integrar ao sorriso, com a mesma atenção à cor e à translucidez.",
      },
    },
    alts: {
      k1: "Ilustração 3D de um molar com coroa de porcelana perolada e raízes de vidro fosco.",
      cutaway:
        "Ilustração 3D do mesmo molar cortado ao meio, mostrando esmalte, dentina e polpa.",
      implant:
        "Ilustração 3D de um implante dentário: coroa de porcelana, pilar e parafuso.",
    },
  },

  treatments,

  shadeGuide: {
    title: "Mais branco nem sempre é mais bonito.",
    body: "Dentistas usam uma escala de cor para escolher o tom de cada dente. A escolha leva em conta a pele, os olhos, a idade e a gengiva — e é isso que separa um resultado natural de um artificial.",
    caption:
      "Cores aproximadas, apenas ilustrativas. A cor ideal é definida em consulta.",
  },

  method: {
    title: "Um método, não um procedimento.",
    steps: [
      {
        title: "Escuta",
        body: "Uma primeira conversa sem pressa sobre o que incomoda você, sua rotina e o resultado que imagina.",
      },
      {
        title: "Planejamento digital e ensaio",
        body: "Fotos, escaneamento e estudo de proporções geram um projeto do novo sorriso, que você pode experimentar antes de decidir.",
      },
      {
        title: "Prova",
        body: "Ajustamos forma e cor com você, até o resultado parecer seu.",
      },
      {
        title: "Execução e acompanhamento",
        body: "O tratamento acontece em etapas claras, com retornos para cuidar do resultado ao longo do tempo.",
      },
    ] satisfies MethodStep[],
  },

  doctor: {
    name: placeholder("Nome da profissional") as Maybe<string>,
    cro: placeholder("CRO-SP") as Maybe<string>,
    bio: placeholder(
      "Biografia real: formação, especialização e trajetória",
    ) as Maybe<string>,
    quote: placeholder(
      "Frase da profissional sobre como trabalha",
    ) as Maybe<string>,
  },

  responsible: {
    name: placeholder("Responsável técnico") as Maybe<string>,
    cro: placeholder("CRO-SP do responsável técnico") as Maybe<string>,
  },

  review: {
    quote: placeholder(
      "Avaliação real do Google, publicada com autorização",
    ) as Maybe<string>,
    author: placeholder("Nome do paciente") as Maybe<string>,
    sourceUrl: placeholder("Link do perfil no Google") as Maybe<string>,
  },

  bookingOptions: [
    ...treatments.map((t) => ({ id: t.id, label: t.name })),
    { id: "avaliacao", label: "Ainda não sei, quero uma avaliação" },
  ],

  faq: [
    {
      question: "As lentes de contato dental desgastam os dentes?",
      answer:
        "Depende de cada caso. Algumas situações permitem pouco ou nenhum desgaste; outras pedem um preparo para que o resultado fique natural e dure. Isso é definido na avaliação, com o planejamento em mãos, antes de qualquer decisão.",
    },
    {
      question: "Quanto tempo duram lentes e facetas?",
      answer:
        "A durabilidade depende do material, da mordida, dos hábitos e das consultas de manutenção. Na avaliação explicamos o que esperar no seu caso e como cuidar do resultado.",
    },
    {
      question: "O clareamento deixa os dentes sensíveis?",
      answer:
        "Pode haver sensibilidade temporária durante o tratamento. O acompanhamento profissional ajusta a concentração do gel e o tempo de uso para reduzir o desconforto.",
    },
    {
      question: "Posso ver como vai ficar antes de começar?",
      answer:
        "Sim. O planejamento digital inclui um ensaio do novo sorriso, para você avaliar forma e proporção antes do tratamento definitivo.",
    },
    {
      question: "Quanto custa?",
      answer:
        "Os valores são definidos após a avaliação, porque cada plano é individual. Você recebe o orçamento por escrito, com as etapas detalhadas.",
    },
    {
      question: "Quanto tempo leva o tratamento?",
      answer:
        "Varia de acordo com o plano. O clareamento costuma levar algumas semanas; lentes e facetas pedem algumas consultas entre planejamento, prova e aplicação.",
    },
    {
      question: "Vocês atendem convênio? Quais as formas de pagamento?",
      answer: placeholder("Convênios aceitos e formas de pagamento"),
    },
  ] satisfies FaqItem[],
} as const;
