export type AssetSpec = {
  id: string;
  kind: "image" | "image-edit" | "keyframes-video";
  prompt: string;
  inputs?: string[];
  size?: string;
  seed?: number;
  width?: number;
  height?: number;
  numFrames?: number;
  frameRate?: number;
};

export type Manifest = { styleSuffix: string; assets: AssetSpec[] };

/** Every problem in the manifest; an empty list means it can be generated in order. */
export function validateManifest(m: Manifest): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const a of m.assets) {
    if (seen.has(a.id)) errors.push(`duplicate id "${a.id}"`);
    for (const input of a.inputs ?? []) {
      if (!seen.has(input)) {
        errors.push(`"${a.id}" uses "${input}" before it is generated`);
      }
    }
    const inputs = a.inputs?.length ?? 0;
    if (a.kind === "image-edit" && inputs !== 1) {
      errors.push(`"${a.id}" needs exactly one input`);
    }
    if (a.kind === "keyframes-video") {
      if (inputs < 2) errors.push(`"${a.id}" needs at least two inputs`);
      const n = a.numFrames ?? 121;
      if (n > 441 || (n - 1) % 8 !== 0) {
        errors.push(`"${a.id}" numFrames must be 8n+1 and ≤ 441`);
      }
    }
    if (a.size && !/^\d+x\d+$/.test(a.size)) {
      errors.push(`"${a.id}" size must look like 1024x1024`);
    }
    seen.add(a.id);
  }
  return errors;
}

export function fullPrompt(m: Manifest, a: AssetSpec): string {
  return `${a.prompt}, ${m.styleSuffix}`;
}
