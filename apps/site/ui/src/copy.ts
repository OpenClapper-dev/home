/**
 * The site's two languages: every string of the page, the forms and the privacy page. `en` is the
 * source of truth for the keys; `de` must carry every one (the type enforces it). The choice is kept in
 * localStorage ("lang"), first guessed from the browser, switched by the button in the bar and mirrored
 * on <html lang>. Position and department labels stay English (the shared vocabulary); the Worker's
 * error messages and the admin view are English.
 */
import type { FilmSystem, Language, Platform, YearsBand } from "@openclapper/home-vocab";
import { useEffect, useState } from "preact/hooks";

export type Lang = "en" | "de";

const en = {
  nav: { goal: "The goal", why: "Why", state: "Where it stands", rug: "The rug", plan: "The plan", ideas: "Contribute", waitlist: "Sign up", lang: "Deutsch", langTitle: "Auf Deutsch lesen" },
  hero: {
    status: "Experimental · open source · self-hosted",
    title: "An open-source way to organise film productions, built together with the people who do the job.",
    lede: "OpenClapper is a project for a flexible, self-hostable toolset for prep and production, any kind of production, any department. It starts here: with your experience, before the first alpha.",
    idea: "Tell me what you need", join: "Sign up as a tester", source: "Source",
  },
  goal: {
    h: "The goal", sub: "A true open-source, self-hostable solution for organising any sort of film production.",
    p: [
      "Film productions are rarely uniform. Sure, there are departments, and for a good part clear responsibilities, but even those differ from one production system to another. The devil is in the details: most projects bring a set of requirements and workflows of their own to keep the teamwork smooth. Every tool I have used imposed a strong opinion of how things should be done, and a fixed workflow for every department fails in practice. OpenClapper prioritises flexibility and customisability over everything else: it has to support anyone’s way of working, not one.",
      "The aim is a set of clients for the web and for mobile, iOS and Android, that enable or enhance every possible workflow, from a one-person crew to a professional production. Open source under Apache 2.0, self-hostable, so your data stays yours.",
    ],
  },
  why: {
    h: "Why I do this", sub: "A short time in film, a lot of fun, and a tool I wish I had.",
    p: [
      "I worked as a 1. Aufnahmeleiter, roughly a 2nd AD in the American system, through prep and production on smaller independent projects. It was a short time in filmmaking, but I had tons of fun, and I learned a lot about myself. The tooling for keeping a production in sync bothered me the whole way: spreadsheets, group chats, PDFs that are outdated by the time they are printed.",
      "I moved on since and became a full-time developer. The moment I started shooting my own hobby projects, the need for a tool to organise the shooting process came straight back. I could sink my time into a niche tool only I use. I would rather build one that everybody can make use of.",
      "In some sense this project is me giving back to a craft that gave me a lot.",
    ],
  },
  state: {
    h: "Where it stands", sub: "Experimental today. Alpha is the target, and it starts with you.",
    p: [
      "You might have seen that the GitHub repositories already carry a lot of code. Those are my experiments: they help me run my current shoots. I doubt you would make any use of them, and that is not the intention. The proper alpha gets defined together with the community, from what you tell me gets in your way. That is the project’s real starting line.",
      "Building it is not the hard part. With today’s frontier AI models, one developer gets a long way on their own. What I cannot generate is knowledge of how productions actually run, in departments and systems I have never worked in. That has to come from you.",
      "What I can promise is time, not speed. This is an open-source project that I build in my free time, next to a full-time job in tech, and that free time is sparse. I am in it for the long haul, and I will keep you posted at every step. In return I ask for one thing from everyone who shares their insights: patience.",
    ],
  },
  rug: {
    h: "Will I pull the rug?", sub: "No. Three plain answers: what open source means here, what I host, and what self-hosting costs.",
    parts: [
      {
        tag: "Open source", h: "The code is yours",
        p: [
          "The code is on GitHub, all of it, under the Apache 2.0 licence, with a guide for deploying it on your own cloud account. Every release is free, now and later; there will never be a paid feature. Run it for your school, your company or your crew, change it, make money with it if you like. That is fine by me. I am the maintainer of OpenClapper, not its owner: without the community’s input there is no alpha and no project worth the name.",
        ],
      },
      {
        tag: "Hosted by me", h: "You do not have to host it",
        p: [
          "I will run a hosted OpenClapper on all clients: web, Android and iOS. The alpha testing happens there, free of charge.",
          "Running things in the cloud costs money at some point, so instead of a fairy tale, here is what I promise. I will be transparent about what it costs me to run this: the invoices and the usage numbers go into the project’s repository for anyone to see. Once the first proper release is out, the hosted version will carry a subscription. I will keep it as low as I can, and how the price is calculated will be public at all times.",
        ],
      },
      {
        tag: "Self-hosted", h: "If you host it yourself",
        p: [
          "Self-hosting is for whoever wants control over their data and their costs, and it gets the same care as the version I host; neither is second class. Nothing is ever paid to me; what you pay is your cloud provider. Before you start, a cost calculator will show you what your instance would cost at your size, and I will ship tooling and guidance for sensible resource limits, so an instance runs as cheaply as it can.",
        ],
      },
    ],
  },
  plan: {
    h: "The plan", sub: "Five steps to the alpha. We are at step one.",
    now: "Now",
    steps: [
      { h: "Spread the word, send requests", p: "Tell your colleagues. Request as many features and describe as many problems as you possibly can; the more the better." },
      { h: "Submissions close", p: "At some point I close the feature requests and work out what the alpha set of features will be." },
      { h: "The feature board", p: "I publish a converged summary of all the features and how I intend to implement them. The community gets another chance to chime in: comments, upvotes, downvotes, concerns." },
      { h: "Implementation", p: "Once I have gathered enough feedback, I build it." },
      { h: "Alpha testing", p: "A set of testers is chosen from the waiting list to test the first iteration." },
    ],
    ticker: "The Call Sheet",
    tickerP: "One mail whenever the plan moves a step, nothing else; every update is posted on this page as well. Sign up below if you want it in your inbox.",
    tickerLink: "Get the Call Sheet",
  },
  ideas: {
    h: "Contribute", sub: "Any experience level, any part of the industry, any problem.",
    p: [
      "Whether you have done one student short or thirty features, whether you are in production, camera, sound, costume, post or anywhere else: your experience is what this project is missing. A single annoyance from a single shoot is a valid contribution.",
      "It does not have to be well written. Brainstorms, half-thoughts, a list of things that went wrong: anything goes. I sort it out and make sense of it.",
    ],
    language: "Write in English or German, whichever comes easier.",
  },
  waitlist: {
    h: "Sign up", sub: "Test the alpha, follow the plan, or both.",
    p: "Alpha testers are picked from this list at step five, with an eye on a varied group: different platforms, departments, systems and languages. The Call Sheet is the mail about the plan.",
  },
  foot: { privacy: "Privacy", license: "© 2026 OpenClapper · Apache 2.0" },
  form: {
    optional: "optional", required: "required",
    draftRestored: "Your unsent draft was restored.", startOver: "Start over",
    botWait: "The bot check has not finished yet; give it a moment.", botFailed: "The bot check could not load", reload: "Reload the page and try again.",
    aboutH: "About you", aboutWhy: "Required, so I can see which departments, systems, languages and experience levels the input comes from, and even out biases early on.", aboutAnon: "No name is asked. Without an email this is completely anonymous.",
    systems: "Which systems have you worked in?", systemsHelp: "Titles and habits differ; it helps me read your positions right. Pick every one that applies.", systemsAria: "Film systems",
    systemLabels: { german: "German", us: "US / International", other: "Other" } as Record<FilmSystem, string>,
    positions: "Your positions", positionsHelp: "Every role you have worked in; many people have more than one.",
    pick: "Pick positions", add: "Add a position", closeList: "Close the list", filter: "Filter: DP, Gaffer, Aufnahmeleitung…", filterAria: "Filter positions", byDept: "Positions by department",
    noMatch: (q: string) => `No position matches "${q}". Pick "Other" and write it in.`, remove: (p: string) => `Remove ${p}`,
    other: "What is “other”?", otherPh: "Drone pilot, intimacy coordinator…",
    years: "Years in the industry", yearsHelp: "Altogether, across every position.", yearsAria: "Years in the industry",
    yearsLabels: { lt1: "Less than a year", "1-3": "1 to 3", "3-6": "3 to 6", "6-9": "6 to 9", "9-12": "9 to 12", "12+": "12 or more" } as Record<YearsBand, string>,
    languages: "Which languages could you test in, or answer questions in?", languagesHelp: "Pick every one that applies.", languagesAria: "Languages",
    languageLabels: { german: "German", english: "English", other: "Another language" } as Record<Language, string>,
    otherLanguage: "Which language?", otherLanguagePh: "French, Polish, Turkish…",
    platforms: "Which platforms could you test on?", platformsHelp: "The web client in a browser; the mobile client on Android or iOS.", platformsAria: "Platforms",
    platformLabels: { web: "Web", android: "Android", ios: "iOS" } as Record<Platform, string>,
    privacy: "Privacy",
  },
  wl: {
    email: "Email", emailHelp: "For the confirmation now, and later for the test invite or the Call Sheet. Nothing else.",
    want: "What for?", wantTester: "The tester waiting list", wantTesterHelp: "Be considered for alpha testing at step five.", wantUpdates: "The Call Sheet", wantUpdatesHelp: "A mail whenever the plan moves a step.",
    aboutWhy: "Required, so I can put together a varied group of testers and see where the interest comes from.",
    submit: "Sign up", fine: "Double opt-in: nothing is kept until you confirm.",
    doneTitle: "One more step: confirm your email", done: (email: string) => `We sent a link to ${email}. Open it within 7 days and you are in. No mail? Check the spam folder, then try again in ten minutes.`,
    confirmedTitle: "You are in", confirmed: "Thanks for confirming. You will hear from me when there is news for you.",
    expiredTitle: "That link does not work any more", expired: "It was used already or is older than 7 days. Sign up again below and a fresh one comes right away.",
  },
  rq: {
    n: (i: number) => `Request ${i}`, removeN: (i: number) => `Remove request ${i}`,
    title: "Title", titlePh: "Call sheets on the phone",
    text: "What do you need?", textHelp: "Brainstorm, bullet points, a rant about the last shoot: anything goes. Which department, what went wrong, what would have helped. English or German, as you like.",
    textRequired: "Write what you need; a sentence is enough.",
    prototype: "Ask me questions while it takes shape",
    addAnother: "Add another request",
    email: "Email",
    emailHelpWants: "You asked for questions, so I need an email to reach you. It is used for nothing else.",
    emailHelp: "Only if you want a way for me to reply. Leave it empty to stay anonymous.",
    submit1: "Send the request", submitN: (n: number) => `Send ${n} requests`,
    fine: "No account, no name. Drafts stay in this browser until sent.",
    doneTitle1: "Thank you, your request is in", doneTitleN: (n: number) => `Thank you, your ${n} requests are in`, done: "I read every one of them.", another: "Send another",
  },
  privacy: {
    title: "Privacy", home: "Home",
    lede: "This page has no analytics, no advertising and no cookies. It stores only what you type into one of its two forms.",
    hostingH: "Hosting", hosting: "openclapper.org runs on Cloudflare (Cloudflare, Inc.), which serves the page, stores the submissions in a database on its network and sends the one confirmation mail. Like every web server, Cloudflare processes your IP address and request metadata to deliver the page and to keep it reachable, and keeps these in its logs for a short time.",
    botH: "The bot check", bot: "Both forms carry Cloudflare Turnstile, which tells humans and bots apart without a puzzle. It runs in your browser and sends Cloudflare a few signals about the browser and the request, including your IP address. Nothing from the form itself goes into that check.",
    aboutH: "About you (both forms)",
    about: "Both forms ask, and require, the film systems you have worked in, your positions in the industry, your years of experience as a band, and the languages you could test or answer questions in. The maintainer needs these to see which direction input comes from and to put together a varied group of testers. No name is asked.",
    wlH: "The sign-up: tester waiting list and the Call Sheet",
    wl1: "Required: your email address, what you sign up for (the tester waiting list, the Call Sheet, or both), for testers the platforms you could test on, and the about-you block.",
    wl2: "The address is used to send you one confirmation mail right away and, later, what you picked: an invitation to the alpha test plus the occasional mail about that test, and/or the Call Sheet, one mail whenever the plan moves a step. It is not shared, sold or used for anything else. A sign-up that is not confirmed within seven days is deleted. A confirmed entry stays until you ask for it to be removed.",
    rqH: "Feature requests",
    rq1: "Required: the text of your request and the about-you block. Optional: a title per request, whether you would answer questions while the feature takes shape, and your email address; the address is required if you tick that. Without an address the submission is anonymous: nothing is linked to an account, and nothing identifies you unless you put it in the text.",
    rq2: "Requests are read by the project's maintainer and kept as long as they are useful for the plan. An address you leave is used only for the questions you asked for; it gets no automatic mail.",
    storageH: "Your browser's storage", storage: "The theme, the language and an unsent form draft are kept in your browser's local storage, so a draft survives a closed tab. Neither leaves your browser; sending a form clears its draft.",
    rightsH: "Your rights, and how to reach me",
    rights1: "You can ask at any time what is stored about you, have it corrected, or have it deleted: mail", rights2: "Removal from the list is immediate.",
    responsible: "Responsible for this site: the maintainer of OpenClapper. Last updated 2026-10-30.",
  },
};
export type Dict = typeof en;

const de: Dict = {
  nav: { goal: "Das Ziel", why: "Warum", state: "Wo es steht", rug: "Der Teppich", plan: "Der Plan", ideas: "Mitmachen", waitlist: "Eintragen", lang: "English", langTitle: "Read in English" },
  hero: {
    status: "Experimentell · Open Source · selbst gehostet",
    title: "Ein Open-Source-Weg, Filmproduk\u00ADtionen zu organisieren, gebaut zusammen mit den Leuten, die den Job machen.",
    lede: "OpenClapper ist ein Projekt für ein flexibles, selbst hostbares Werkzeugset für Vorbereitung und Dreh, für jede Art von Produktion, jedes Department. Es beginnt hier: mit eurer Erfahrung, vor der ersten Alpha.",
    idea: "Sag mir, was du brauchst", join: "Als Tester eintragen", source: "Quellcode",
  },
  goal: {
    h: "Das Ziel", sub: "Eine echte Open-Source-Lösung zum Selbsthosten, um jede Art von Filmproduktion zu organisieren.",
    p: [
      "Filmproduktionen sind selten einheitlich. Klar, es gibt Departments und zu einem guten Teil klare Zuständigkeiten, aber selbst die unterscheiden sich von einem Produktionssystem zum anderen. Der Teufel steckt im Detail: Die meisten Projekte bringen eigene Anforderungen und Abläufe mit, damit die Zusammenarbeit reibungslos läuft. Jedes Werkzeug, das ich benutzt habe, hatte eine feste Meinung davon, wie Dinge zu laufen haben, und ein fester Ablauf für jedes Department scheitert in der Praxis. OpenClapper stellt Flexibilität und Anpassbarkeit über alles andere: Es muss jede Arbeitsweise unterstützen, nicht eine.",
      "Das Ziel ist ein Satz von Clients für das Web und für Mobilgeräte, iOS und Android, die jeden denkbaren Ablauf ermöglichen oder verbessern, vom Ein-Personen-Team bis zur professionellen Produktion. Open Source unter Apache 2.0, selbst hostbar, damit eure Daten eure bleiben.",
    ],
  },
  why: {
    h: "Warum ich das mache", sub: "Eine kurze Zeit beim Film, viel Spaß, und ein Werkzeug, das ich mir gewünscht hätte.",
    p: [
      "Ich habe als 1. Aufnahmeleiter, im amerikanischen System ungefähr ein 2nd AD, Vorbereitung und Dreh kleinerer unabhängiger Projekte begleitet. Es war eine kurze Zeit beim Film, aber ich hatte eine Menge Spaß und habe viel über mich gelernt. Die Werkzeuge, mit denen man eine Produktion auf einem Stand hält, haben mich die ganze Zeit gestört: Tabellen, Gruppenchats, PDFs, die beim Ausdrucken schon veraltet sind.",
      "Ich bin inzwischen weitergezogen und Vollzeit-Entwickler geworden. Kaum habe ich eigene Hobbyprojekte gedreht, war der Bedarf nach einem Werkzeug für die Drehorganisation sofort wieder da. Ich könnte meine Zeit in ein Nischenwerkzeug stecken, das nur ich benutze. Lieber baue ich eines, das alle nutzen können.",
      "In gewisser Weise gebe ich mit diesem Projekt einem Handwerk etwas zurück, das mir viel gegeben hat.",
    ],
  },
  state: {
    h: "Wo es steht", sub: "Heute experimentell. Die Alpha ist das Ziel, und sie beginnt mit euch.",
    p: [
      "Vielleicht habt ihr gesehen, dass in den GitHub-Repositories schon eine Menge Code liegt. Das sind meine Experimente: Sie helfen mir bei meinen aktuellen Drehs. Ich bezweifle, dass ihr damit etwas anfangen könnt, und das ist auch nicht der Zweck. Die eigentliche Alpha wird zusammen mit der Community definiert, aus dem, was ihr mir erzählt, was euch im Weg steht. Das ist die wirkliche Startlinie des Projekts.",
      "Das Bauen ist nicht der schwere Teil. Mit den heutigen KI-Modellen kommt ein einzelner Entwickler allein sehr weit. Was ich nicht erzeugen kann, ist das Wissen darüber, wie Produktionen tatsächlich laufen, in Departments und Systemen, in denen ich nie gearbeitet habe. Das muss von euch kommen.",
      "Was ich versprechen kann, ist Zeit, nicht Tempo. Das ist ein Open-Source-Projekt, das ich in meiner Freizeit baue, neben einem Vollzeitjob in der Tech-Branche, und diese Freizeit ist knapp. Ich bin auf lange Sicht dabei, und ich halte euch bei jedem Schritt auf dem Laufenden. Im Gegenzug bitte ich alle, die ihre Erfahrung teilen, um eines: Geduld.",
    ],
  },
  rug: {
    h: "Ziehe ich den Teppich weg?", sub: "Nein. Drei klare Antworten: Was Open Source hier bedeutet, was ich hoste und was Selbsthosten kostet.",
    parts: [
      {
        tag: "Open Source", h: "Der Code gehört euch",
        p: [
          "Der Code liegt auf GitHub, vollständig, unter der Apache-2.0-Lizenz, mit einer Anleitung, wie man ihn auf dem eigenen Cloud-Konto installiert. Jedes Release ist kostenlos, jetzt und später; es wird nie eine bezahlte Funktion geben. Betreibt es für eure Schule, eure Firma oder euer Team, verändert es, verdient Geld damit, wenn ihr wollt. Das ist für mich in Ordnung. Ich bin der Maintainer von OpenClapper, nicht sein Eigentümer: Ohne den Input der Community gibt es keine Alpha und kein Projekt, das den Namen verdient.",
        ],
      },
      {
        tag: "Von mir gehostet", h: "Ihr müsst es nicht selbst hosten",
        p: [
          "Ich werde ein gehostetes OpenClapper auf allen Clients betreiben: Web, Android und iOS. Der Alpha-Test findet dort statt, kostenlos.",
          "Dinge in der Cloud zu betreiben kostet irgendwann Geld, also statt eines Märchens hier mein Versprechen. Ich lege offen, was mich der Betrieb kostet: Die Rechnungen und die Nutzungszahlen kommen ins Repository des Projekts, für alle einsehbar. Sobald das erste richtige Release draußen ist, wird die gehostete Version ein Abo haben. Ich halte es so niedrig, wie ich kann, und wie sich der Preis zusammensetzt, ist jederzeit öffentlich.",
        ],
      },
      {
        tag: "Selbst gehostet", h: "Wenn ihr es selbst hostet",
        p: [
          "Selbsthosten ist für alle, die Kontrolle über ihre Daten und ihre Kosten wollen, und es bekommt dieselbe Sorgfalt wie die Version, die ich hoste; keine ist zweite Klasse. An mich wird nie etwas bezahlt; was ihr bezahlt, ist euer Cloud-Anbieter. Bevor ihr anfangt, zeigt euch ein Kostenrechner, was eure Instanz in eurer Größe kosten würde, und ich liefere Werkzeuge und Empfehlungen für sinnvolle Ressourcengrenzen, damit eine Instanz so günstig wie möglich läuft.",
        ],
      },
    ],
  },
  plan: {
    h: "Der Plan", sub: "Fünf Schritte bis zur Alpha. Wir sind bei Schritt eins.",
    now: "Jetzt",
    steps: [
      { h: "Weitersagen, Wünsche schicken", p: "Erzählt es euren Kolleginnen und Kollegen. Wünscht euch so viele Funktionen und beschreibt so viele Probleme, wie ihr nur könnt; je mehr, desto besser." },
      { h: "Einreichung schließt", p: "Irgendwann schließe ich die Feature-Wünsche und arbeite heraus, was der Funktionsumfang der Alpha sein wird." },
      { h: "Das Feature-Board", p: "Ich veröffentliche eine zusammengeführte Übersicht aller Funktionen und wie ich sie umsetzen will. Die Community bekommt eine weitere Gelegenheit, sich einzubringen: Kommentare, Upvotes, Downvotes, Bedenken." },
      { h: "Umsetzung", p: "Sobald ich genug Rückmeldungen gesammelt habe, baue ich es." },
      { h: "Alpha-Test", p: "Eine Gruppe von Testern wird aus der Warteliste ausgewählt, um die erste Iteration zu testen." },
    ],
    ticker: "Das Call Sheet",
    tickerP: "Eine Mail, wann immer der Plan einen Schritt weitergeht, sonst nichts; jedes Update steht auch hier auf der Seite. Trag dich unten ein, wenn du es im Postfach haben willst.",
    tickerLink: "Call Sheet bekommen",
  },
  ideas: {
    h: "Mitmachen", sub: "Jedes Erfahrungslevel, jeder Teil der Branche, jedes Problem.",
    p: [
      "Ob ihr einen Studentenkurzfilm gemacht habt oder dreißig Langfilme, ob ihr in der Produktion, bei der Kamera, beim Ton, im Kostüm, in der Post oder sonstwo seid: Eure Erfahrung ist das, was diesem Projekt fehlt. Ein einzelnes Ärgernis von einem einzelnen Dreh ist ein gültiger Beitrag.",
      "Es muss nicht gut geschrieben sein. Brainstorms, halbe Gedanken, eine Liste von Dingen, die schiefgegangen sind: Alles geht. Ich sortiere es und mache etwas daraus.",
    ],
    language: "Schreibt auf Deutsch oder Englisch, wie es leichter fällt.",
  },
  waitlist: {
    h: "Eintragen", sub: "Die Alpha testen, dem Plan folgen, oder beides.",
    p: "Alpha-Tester werden bei Schritt fünf aus dieser Liste ausgewählt, mit Blick auf eine gemischte Gruppe: verschiedene Plattformen, Departments, Systeme und Sprachen. Das Call Sheet ist die Mail zum Plan.",
  },
  foot: { privacy: "Datenschutz", license: "© 2026 OpenClapper · Apache 2.0" },
  form: {
    optional: "optional", required: "Pflichtfeld",
    draftRestored: "Dein ungesendeter Entwurf wurde wiederhergestellt.", startOver: "Neu anfangen",
    botWait: "Die Bot-Prüfung ist noch nicht fertig; einen Moment bitte.", botFailed: "Die Bot-Prüfung konnte nicht geladen werden", reload: "Lade die Seite neu und versuch es noch einmal.",
    aboutH: "Über dich", aboutWhy: "Pflicht, damit ich sehe, aus welchen Departments, Systemen, Sprachen und Erfahrungsstufen der Input kommt, und Verzerrungen früh ausgleichen kann.", aboutAnon: "Es wird kein Name abgefragt. Ohne E-Mail ist das vollständig anonym.",
    systems: "In welchen Systemen hast du gearbeitet?", systemsHelp: "Bezeichnungen und Gewohnheiten unterscheiden sich; es hilft mir, deine Positionen richtig zu lesen. Wähl alles, was zutrifft.", systemsAria: "Filmsysteme",
    systemLabels: { german: "Deutsch", us: "US / International", other: "Anderes" },
    positions: "Deine Positionen", positionsHelp: "Jede Rolle, in der du gearbeitet hast; viele haben mehr als eine.",
    pick: "Positionen wählen", add: "Position hinzufügen", closeList: "Liste schließen", filter: "Filtern: DP, Gaffer, Aufnahmeleitung…", filterAria: "Positionen filtern", byDept: "Positionen nach Department",
    noMatch: (q: string) => `Keine Position passt zu „${q}“. Wähl „Other“ und schreib sie dazu.`, remove: (p: string) => `${p} entfernen`,
    other: "Was heißt „Other“?", otherPh: "Drohnenpilot, Intimitätskoordination…",
    years: "Jahre in der Branche", yearsHelp: "Insgesamt, über alle Positionen hinweg.", yearsAria: "Jahre in der Branche",
    yearsLabels: { lt1: "Unter einem Jahr", "1-3": "1 bis 3", "3-6": "3 bis 6", "6-9": "6 bis 9", "9-12": "9 bis 12", "12+": "12 oder mehr" },
    languages: "In welchen Sprachen könntest du testen oder Fragen beantworten?", languagesHelp: "Wähl alles, was zutrifft.", languagesAria: "Sprachen",
    languageLabels: { german: "Deutsch", english: "Englisch", other: "Eine andere Sprache" },
    otherLanguage: "Welche Sprache?", otherLanguagePh: "Französisch, Polnisch, Türkisch…",
    platforms: "Auf welchen Plattformen könntest du testen?", platformsHelp: "Der Web-Client im Browser; der mobile Client auf Android oder iOS.", platformsAria: "Plattformen",
    platformLabels: { web: "Web", android: "Android", ios: "iOS" },
    privacy: "Datenschutz",
  },
  wl: {
    email: "E-Mail", emailHelp: "Für die Bestätigung jetzt und später für die Test-Einladung oder das Call Sheet. Sonst nichts.",
    want: "Wofür?", wantTester: "Die Tester-Warteliste", wantTesterHelp: "Bei Schritt fünf für den Alpha-Test in Betracht kommen.", wantUpdates: "Das Call Sheet", wantUpdatesHelp: "Eine Mail, wann immer der Plan einen Schritt weitergeht.",
    aboutWhy: "Pflicht, damit ich eine gemischte Testergruppe zusammenstellen kann und sehe, woher das Interesse kommt.",
    submit: "Eintragen", fine: "Double Opt-in: Nichts wird gespeichert, bis du bestätigst.",
    doneTitle: "Noch ein Schritt: Bestätige deine E-Mail", done: (email: string) => `Wir haben einen Link an ${email} geschickt. Öffne ihn innerhalb von 7 Tagen, dann bist du dabei. Keine Mail? Schau in den Spam-Ordner und versuch es in zehn Minuten noch einmal.`,
    confirmedTitle: "Du bist dabei", confirmed: "Danke fürs Bestätigen. Du hörst von mir, sobald es Neuigkeiten für dich gibt.",
    expiredTitle: "Dieser Link funktioniert nicht mehr", expired: "Er wurde schon benutzt oder ist älter als 7 Tage. Trag dich unten noch einmal ein, dann kommt sofort ein neuer.",
  },
  rq: {
    n: (i: number) => `Wunsch ${i}`, removeN: (i: number) => `Wunsch ${i} entfernen`,
    title: "Titel", titlePh: "Dispo auf dem Handy",
    text: "Was brauchst du?", textHelp: "Brainstorm, Stichpunkte, ein Rant über den letzten Dreh: Alles geht. Welches Department, was schiefging, was geholfen hätte. Deutsch oder Englisch, wie du magst.",
    textRequired: "Schreib, was du brauchst; ein Satz reicht.",
    prototype: "Stell mir Fragen, während es Form annimmt",
    addAnother: "Noch einen Wunsch hinzufügen",
    email: "E-Mail",
    emailHelpWants: "Du hast um Fragen gebeten, also brauche ich eine E-Mail-Adresse, um dich zu erreichen. Sie wird für nichts anderes verwendet.",
    emailHelp: "Nur, wenn du einen Weg für eine Antwort willst. Leer lassen, um anonym zu bleiben.",
    submit1: "Wunsch abschicken", submitN: (n: number) => `${n} Wünsche abschicken`,
    fine: "Kein Konto, kein Name. Entwürfe bleiben in diesem Browser, bis sie gesendet sind.",
    doneTitle1: "Danke, dein Wunsch ist angekommen", doneTitleN: (n: number) => `Danke, deine ${n} Wünsche sind angekommen`, done: "Ich lese jeden einzelnen.", another: "Noch einen schicken",
  },
  privacy: {
    title: "Datenschutz", home: "Startseite",
    lede: "Diese Seite hat keine Analytics, keine Werbung und keine Cookies. Sie speichert nur, was du in eines ihrer zwei Formulare eingibst.",
    hostingH: "Hosting", hosting: "openclapper.org läuft bei Cloudflare (Cloudflare, Inc.), das die Seite ausliefert, die Formulareingaben in einer Datenbank in seinem Netz speichert und die eine Bestätigungsmail verschickt. Wie jeder Webserver verarbeitet Cloudflare deine IP-Adresse und Anfragedaten, um die Seite auszuliefern und erreichbar zu halten, und behält sie kurze Zeit in seinen Protokollen.",
    botH: "Die Bot-Prüfung", bot: "Beide Formulare tragen Cloudflare Turnstile, das Menschen und Bots ohne Rätsel unterscheidet. Es läuft in deinem Browser und schickt Cloudflare ein paar Signale über Browser und Anfrage, darunter deine IP-Adresse. Nichts aus dem Formular selbst fließt in diese Prüfung ein.",
    aboutH: "Über dich (beide Formulare)",
    about: "Beide Formulare fragen verpflichtend nach den Filmsystemen, in denen du gearbeitet hast, deinen Positionen in der Branche, deinen Jahren an Erfahrung als Spanne und den Sprachen, in denen du testen oder Fragen beantworten könntest. Der Maintainer braucht das, um zu sehen, aus welcher Richtung Input kommt, und um eine gemischte Testergruppe zusammenzustellen. Es wird kein Name abgefragt.",
    wlH: "Das Eintragen: Tester-Warteliste und Call Sheet",
    wl1: "Pflicht: deine E-Mail-Adresse, wofür du dich einträgst (die Tester-Warteliste, das Call Sheet oder beides), für Tester die Plattformen, auf denen du testen könntest, und der Block über dich.",
    wl2: "Die Adresse wird benutzt, um dir sofort eine Bestätigungsmail zu schicken und später das, was du gewählt hast: eine Einladung zum Alpha-Test plus gelegentlich eine Mail zu diesem Test, und/oder das Call Sheet, eine Mail, wann immer der Plan einen Schritt weitergeht. Sie wird nicht weitergegeben, verkauft oder für anderes verwendet. Eine Anmeldung, die nicht innerhalb von sieben Tagen bestätigt wird, wird gelöscht. Ein bestätigter Eintrag bleibt, bis du um Löschung bittest.",
    rqH: "Feature-Wünsche",
    rq1: "Pflicht: der Text deines Wunsches und der Block über dich. Optional: ein Titel pro Wunsch, ob du Fragen beantworten würdest, während die Funktion Form annimmt, und deine E-Mail-Adresse; die Adresse ist Pflicht, wenn du das ankreuzt. Ohne Adresse ist die Einsendung anonym: Nichts ist mit einem Konto verknüpft, und nichts identifiziert dich, außer du schreibst es in den Text.",
    rq2: "Wünsche liest der Maintainer des Projekts; sie bleiben, solange sie für den Plan nützlich sind. Eine Adresse, die du hinterlässt, wird nur für die Fragen verwendet, um die du gebeten hast; sie bekommt keine automatische Mail.",
    storageH: "Der Speicher deines Browsers", storage: "Design, Sprache und ein ungesendeter Formularentwurf liegen im lokalen Speicher deines Browsers, damit ein Entwurf einen geschlossenen Tab überlebt. Nichts davon verlässt deinen Browser; das Absenden eines Formulars löscht seinen Entwurf.",
    rightsH: "Deine Rechte, und wie du mich erreichst",
    rights1: "Du kannst jederzeit erfragen, was über dich gespeichert ist, es berichtigen oder löschen lassen: Mail an", rights2: "Die Streichung von der Liste erfolgt sofort.",
    responsible: "Verantwortlich für diese Seite: der Maintainer von OpenClapper. Zuletzt aktualisiert am 30.10.2026.",
  },
};

const DICTS: Record<Lang, Dict> = { en, de };

function stored(): Lang {
  try { const v = localStorage.getItem("lang"); if (v === "en" || v === "de") return v; } catch { /* no storage */ }
  return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("de") ? "de" : "en";
}
let current: Lang = stored();
const listeners = new Set<(l: Lang) => void>();
function apply(l: Lang) { document.documentElement.lang = l; }
if (typeof document !== "undefined") apply(current);

export function setLang(l: Lang) {
  try { localStorage.setItem("lang", l); } catch { /* ignore */ }
  current = l;
  apply(l);
  for (const cb of listeners) cb(l);
}

/** The current dictionary and language as state; re-renders on a switch. */
export function useT(): [Dict, Lang, (l: Lang) => void] {
  const [lang, set] = useState(current);
  useEffect(() => { listeners.add(set); return () => { listeners.delete(set); }; }, []);
  return [DICTS[lang], lang, setLang];
}
