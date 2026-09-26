import { HeroTitle } from "@/components/motion/hero-title";
import { ShaderSlot } from "@/components/shader/shader-slot";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { clinic } from "@/content/clinic";
import { bookingHref } from "@/lib/contact";
import { SCENE } from "@/lib/scene";
import {
  SceneFrames,
  SceneLabels,
  SceneProvider,
  WipeLayer,
} from "./scene-context";
import { SceneStill } from "./scene-still";

// Copy blocks share one grid cell; only the active beat's block is shown.
// Inactive blocks are visibility:hidden (not just transparent) so they never
// catch clicks, keyboard focus or screen-reader focus over the active one.
const beatBlock =
  "col-start-1 row-start-1 transition-[opacity,visibility] duration-(--duration-reveal) ease-soft motion-reduce:col-auto motion-reduce:row-auto motion-reduce:visible! motion-reduce:opacity-100!";

/**
 * The hero: a pinned, scroll-driven story of a glass molar. It turns (frame
 * sequence), opens into its layers and becomes an implant (oval mask wipes).
 * Rendered on the server; only scroll tracking, wipes, frames and labels are
 * client islands. With reduced motion nothing pins: stills and copy stack.
 */
export function ToothScene() {
  const { hero, scene } = clinic;
  return (
    <SceneProvider
      trackClassName="relative h-[300vh] max-md:h-[220vh] motion-reduce:h-auto"
      stickyClassName="sticky top-0 flex h-svh items-center overflow-hidden pt-16 lg:pt-20 motion-reduce:static motion-reduce:h-auto motion-reduce:py-28"
    >
      <p
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[6%] select-none text-center font-display text-[clamp(6rem,24vw,24rem)] font-light leading-none tracking-[-0.04em] text-foreground/[0.05] motion-reduce:hidden"
      >
        Opalina
      </p>

      <Container className="relative grid items-center gap-6 md:grid-cols-12 md:gap-8">
        {/* Copy: intro during the turn, then each beat takes its place. */}
        <div className="order-2 grid md:order-1 md:col-span-6 motion-reduce:gap-16">
          <div
            className={`${beatBlock} group-data-[beat=layers]/scene:invisible group-data-[beat=implant]/scene:invisible group-data-[beat=layers]/scene:opacity-0 group-data-[beat=implant]/scene:opacity-0`}
          >
            <HeroTitle
              id="hero-title"
              className="max-w-[15ch] text-balance font-display text-display font-light max-md:text-[clamp(2.25rem,9vw,3rem)] [@media(max-height:700px)]:max-md:text-[2rem] [@media(min-width:768px)_and_(max-height:820px)]:text-[clamp(2.75rem,4.2vw,4rem)]"
            >
              {hero.title}
            </HeroTitle>
            <p className="mt-5 max-w-[46ch] text-supporting text-foreground/80 md:mt-8 [@media(max-height:700px)]:mt-3 [@media(max-height:700px)]:text-[0.9375rem] [@media(max-height:700px)]:leading-snug [@media(min-width:768px)_and_(max-height:820px)]:mt-5">
              {hero.lead} {hero.body}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 md:mt-10 [@media(max-height:700px)]:mt-4 [@media(min-width:768px)_and_(max-height:820px)]:mt-7">
              <ButtonLink href={bookingHref(clinic.whatsappLink)}>
                Agendar avaliação
              </ButtonLink>
              <ButtonLink
                href="#tratamentos"
                variant="ghost"
                className="self-start sm:self-auto"
              >
                Conhecer os tratamentos
              </ButtonLink>
            </div>
            <p className="mt-8 max-w-[40ch] border-l border-accent/50 pl-4 text-caption text-muted max-md:hidden md:mt-12">
              {hero.trust}
            </p>
          </div>

          <div
            className={`${beatBlock} invisible opacity-0 group-data-[beat=layers]/scene:visible group-data-[beat=layers]/scene:opacity-100`}
          >
            <h2 className="text-balance font-display text-heading font-light">
              {scene.beats.layers.title}
            </h2>
            <p className="mt-5 max-w-[46ch] text-supporting text-foreground/80">
              {scene.beats.layers.body}
            </p>
          </div>

          <div
            className={`${beatBlock} invisible opacity-0 group-data-[beat=implant]/scene:visible group-data-[beat=implant]/scene:opacity-100`}
          >
            <h2 className="text-balance font-display text-heading font-light">
              {scene.beats.implant.title}
            </h2>
            <p className="mt-5 max-w-[46ch] text-supporting text-foreground/80">
              {scene.beats.implant.body}
            </p>
            <ButtonLink
              href={bookingHref(clinic.whatsappLink)}
              className="mt-8"
            >
              Agendar avaliação
            </ButtonLink>
          </div>
        </div>

        {/* Stage: poster, turning frames, then the wipes. */}
        <div className="order-1 md:order-2 md:col-span-6">
          <div className="relative mx-auto aspect-square w-[min(80vw,40svh)] [@media(max-height:700px)]:w-[min(60vw,26svh)] md:w-full md:max-w-[36rem] [@media(min-width:768px)_and_(max-height:820px)]:md:max-w-[min(36rem,70svh)] motion-reduce:aspect-auto motion-reduce:w-full">
            {/* Images fade out at the edges so the tooth floats on the page. */}
            <div className="group/stage absolute inset-0 [mask-image:radial-gradient(closest-side,#000_78%,transparent)] motion-reduce:relative motion-reduce:flex motion-reduce:flex-col motion-reduce:gap-10 motion-reduce:[mask-image:none]">
              <div className="absolute inset-[10%] overflow-hidden rounded-full opacity-70 blur-2xl motion-reduce:hidden">
                <ShaderSlot variant="hero" />
              </div>
              <SceneStill
                name="k1"
                alt={scene.alts.k1}
                priority
                className="absolute inset-0 transition-opacity duration-(--duration-ui) group-has-[[data-drawn=true]]/stage:opacity-0 motion-reduce:relative"
              />
              <SceneFrames className="mix-blend-multiply motion-reduce:hidden" />
              <WipeLayer
                start={SCENE.turnEnd}
                className="absolute inset-0 motion-reduce:relative motion-reduce:[clip-path:none]!"
              >
                <SceneStill name="cutaway" alt={scene.alts.cutaway} />
              </WipeLayer>
              <WipeLayer
                start={SCENE.layersEnd}
                className="absolute inset-0 motion-reduce:relative motion-reduce:[clip-path:none]!"
              >
                <SceneStill name="implant" alt={scene.alts.implant} />
              </WipeLayer>
            </div>
            <SceneLabels />
          </div>
          <p className="mx-auto mt-4 max-w-[40ch] text-center text-caption text-muted transition-opacity duration-(--duration-reveal) group-data-[beat=layers]/scene:opacity-0 group-data-[beat=implant]/scene:opacity-0 max-md:hidden motion-reduce:opacity-100!">
            {scene.beats.turn.title} {scene.beats.turn.body}
          </p>
        </div>
      </Container>
    </SceneProvider>
  );
}
