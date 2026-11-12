// The newer looks of the "Something big is coming" popup. They all say the same thing (every detail is hidden,
// tap to see the Upcoming events page), only the design is different.
// You never edit this file. The design is picked by itself (see site/designs.js).
// Names: slot, scratch, chat, comic, news, bsod, clapper, synth, spy, quest, cyber (cyber lives in site/Cyber.jsx)
import PosterStage from './PosterStage';
import { Actions, Desc, Shell, Title } from './popupParts';
import { Bomb, BsodScreen, ChatThread, Chest, Clapper, ComicPanel, Reels, ScratchPanel, Sunset, TvScreen } from './newParts';
import { CyberPopup } from './Cyber';
import './PopupStyles.css';
import './PopupStylesNew.css';

/* ---------- slot machine ---------- */
function Slot({ text, ...p }) {
  return (
    <Shell name="slot" extra="pq" p={p}>
      <div className="pq-lamps" aria-hidden="true">{Array.from({ length: 13 }, (_, i) => <i key={i} />)}</div>
      <PosterStage kind="popup"><Reels /></PosterStage>
      <div className="pp-body">
        <Title fx="slot" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- scratch card ---------- */
function Scratch({ text, ...p }) {
  return (
    <Shell name="scratch" extra="pq" p={p}>
      <div className="pq-sc-head" aria-hidden="true"><b>Scratch to reveal</b></div>
      <PosterStage kind="popup"><ScratchPanel /></PosterStage>
      <div className="pp-body">
        <Title fx="scratch" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- chat ---------- */
function Chat({ text, ...p }) {
  return (
    <Shell name="chat" extra="pq" p={p}>
      <div className="pq-ct-bar" aria-hidden="true">
        <span className="pq-ct-ava">?</span>
        <span className="pq-ct-who"><b>Unknown sender</b><i>typing...</i></span>
      </div>
      <PosterStage kind="popup"><ChatThread /></PosterStage>
      <div className="pp-body">
        <Title fx="chat" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- comic book ---------- */
function Comic({ text, ...p }) {
  return (
    <Shell name="comic" extra="pq" p={p}>
      <PosterStage kind="popup"><ComicPanel /></PosterStage>
      <div className="pp-body">
        <Title fx="comic" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- breaking news ---------- */
function News({ text, ...p }) {
  return (
    <Shell name="news" extra="pq" p={p}>
      <PosterStage kind="popup"><TvScreen /></PosterStage>
      <div className="pp-body">
        <span className="pq-nw-tag" aria-hidden="true"><i /> Developing story</span>
        <Title fx="news" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- crash screen ---------- */
function Bsod({ text, ...p }) {
  return (
    <Shell name="bsod" extra="pq" p={p}>
      <PosterStage kind="popup"><BsodScreen /></PosterStage>
      <div className="pp-body">
        <Title fx="bsod" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- movie clapperboard ---------- */
function Clap({ text, ...p }) {
  return (
    <Shell name="clapper" extra="pq" p={p}>
      <PosterStage kind="popup"><Clapper /></PosterStage>
      <div className="pp-body">
        <Title fx="clapper" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- synthwave sunset ---------- */
function Synth({ text, ...p }) {
  return (
    <Shell name="synth" extra="pq" p={p}>
      <PosterStage kind="popup"><Sunset /></PosterStage>
      <div className="pp-body">
        <Title fx="synth" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- spy self-destruct ---------- */
function Spy({ text, ...p }) {
  return (
    <Shell name="spy" extra="pq" p={p}>
      <PosterStage kind="popup"><Bomb /></PosterStage>
      <div className="pp-body">
        <span className="pq-sp-tag" aria-hidden="true"><i /> Top secret</span>
        <Title fx="spy" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

/* ---------- RPG quest ---------- */
function Quest({ text, ...p }) {
  return (
    <Shell name="quest" extra="pq" p={p}>
      <PosterStage kind="popup"><Chest /></PosterStage>
      <div className="pp-body">
        <span className="pq-qs-tag" aria-hidden="true">New quest</span>
        <Title fx="quest" text={text} />
        <Desc text={text} />
        <Actions text={text} p={p} />
      </div>
    </Shell>
  );
}

const DESIGNS = { slot: Slot, scratch: Scratch, chat: Chat, comic: Comic, news: News, bsod: Bsod, clapper: Clap, synth: Synth, spy: Spy, quest: Quest, cyber: CyberPopup };

/* picks the design by name (an unknown name falls back to the slot machine) */
export default function PopupStyleNew({ name, ...props }) {
  const Design = DESIGNS[name] || Slot;
  return <Design {...props} />;
}

