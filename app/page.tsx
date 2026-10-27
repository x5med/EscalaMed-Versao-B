import ExperienceLayer from "./components/ExperienceLayer";
import { referencePage } from "../lib/reference-page";

export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: referencePage.styles }} />
      <div
        className="em-page"
        dangerouslySetInnerHTML={{ __html: referencePage.markup }}
      />
      <ExperienceLayer />
    </>
  );
}
