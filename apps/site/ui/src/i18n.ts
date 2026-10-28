/**
 * The site's two languages. `en` is the source of truth for the keys; `de` must carry every one (the
 * type enforces it). The choice is kept in localStorage ("lang"), first guessed from the browser, and
 * mirrored on <html lang>. The admin view stays English.
 */
import { useEffect, useState } from "preact/hooks";

export type Lang = "en" | "de";

const en = {
  nav: { apps: "The apps", support: "Support", ideas: "Ideas", waitlist: "Waiting list", theme: "Theme", lang: "Deutsch", langTitle: "Auf Deutsch lesen" },
  hero: {
    status: "Early alpha · self-hosted · open source",
    title: "Tooling for film prep and production, built by someone who did the job.",
    lede: "OpenClapper organises a production from the first idea to the last shooting day, keeps the crew in sync, and runs on infrastructure you own. Open source under Apache 2.0.",
    join: "Join the tester waiting list", idea: "Send an idea", source: "Source",
  },
  origin: {
    h: "Where it comes from", sub: "A production tool from the production office.",
    p: [
      "I worked as a 1. Aufnahmeleiter, roughly a 2nd AD in the American system, through prep and production on smaller independent projects. I know first-hand how poor the tooling is for organising a production and keeping everybody in sync: spreadsheets, group chats, PDFs that are outdated by the time they are printed.",
      "I left the industry and became a full-time developer. The moment I started shooting my own hobby projects, the need for a tool to organise the shooting process came straight back. OpenClapper is my answer to it.",
      "Rather than sink time and money into a niche tool only I use, I am committed to building a real open-source solution for organising prep and production.",
    ],
  },
  who: {
    h: "Who it is for", sub: "Small crews first. Whole productions eventually. Your own infrastructure always.",
    p: [
      "The first users are small independent crews and solo filmmakers. The aim beyond that is to cover prep and production end to end, for larger productions too.",
      "Anyone can self-host the whole ecosystem: a film school, a small production company, a one-person crew. Your data stays yours, and the running costs stay small.",
      "There is no lock-in. An export of all your data from your own instance is planned, and if you ever want to move to or from another tool, I will do my best to help with the migration.",
    ],
  },
  apps: {
    h: "The ecosystem", sub: "Three apps, one system.",
    note: "Features are deliberately not listed here: the project is in alpha, many of them are shaped by one cinematographer’s workflow, and they will change and merge as more people use it. A detailed list of supported workflows comes once OpenClapper leaves alpha.",
    cols: { app: "App", platform: "Platform", what: "What it is" },
    web: "Web", phone: "Phone",
    studio: "The main web application, where the work is done: organising and planning a production.",
    mobile: "A lightweight companion that helps you stay on track, closely integrated with the Studio.",
    admin: "The operator’s side of an instance: user management and resource management for whoever runs OpenClapper for a school, a company or a crew.",
  },
  support: {
    h: "State of support", sub: "What runs where today.",
    browsersTag: "Studio and Admin", browsersH: "Chrome and Chromium browsers", browsers: "Strongly recommended. Other browsers may work, but they are untested.",
    mobileTag: "Mobile", mobileH: "Android", mobile: "An iOS app is planned. The ecosystem is meant to stay cross-platform.", ios: "iOS planned",
    hostTag: "Self-hosting", hostH: "Cloudflare and GitHub", host: "A deployment runs on a Cloudflare account and is managed from a GitHub repository.", why: "Why these services?",
    whyTitle: "Why Cloudflare and GitHub?",
    whyIntro: "Self-hosting should cost a small company, a film school or an independent crew nothing to start, and as little as possible to run. Both services make that true today.",
    github: "A very generous free tier for managing a deployment: a self-hoster does not pay for it. And it is the de-facto standard of the open-source community, where OpenClapper lives anyway.",
    cloudflare1: "The most comprehensive set of cloud services for what OpenClapper needs, in one account: compute, a database, file storage, mail, access control. The free tier covers compute, so starting costs nothing.",
    cloudflare2: "File storage is where a production tool spends its money, and Cloudflare’s pricing for it is by far the cheapest among the cloud providers. Zero Trust adds tight access policies for the admin side at no extra cost.",
    bothH: "Both", both: "Both have very strong support in LLM coding agents, which makes setting up a self-hosted instance comparatively easy, even without a developer on the team.",
  },
  alpha: {
    h: "What alpha means", sub: "Early prototyping, in daily use, not ready for professional workflows.",
    p: [
      "OpenClapper is in alpha: an early prototyping stage. Many features exist already and I use the app a lot for my own projects. As it stands, though, it is not a good experience for more professional workflows.",
      "My aim for alpha is to establish a baseline of supported features, drawn from the community’s requests. At some point I will freeze that list, build it out, and roll it out for testing.",
      "During alpha there is no guarantee of backwards compatibility. If you self-host now and move along with the updates, chances are that big things break at some point. That is the unfortunate reality of an alpha. From the beta release on, backwards compatibility is guaranteed.",
    ],
  },
  maintainer: {
    h: "One maintainer", sub: "A note on timeframes.",
    p: [
      "I am one person, with a full-time job. Please be realistic about how long it will take to get this project going.",
      "AI is accelerating the speed at which I can deliver features dramatically. Testing and prototyping become all the more important for it, and that cannot be automated away. Which is where you come in.",
    ],
  },
  hosted: {
    h: "The hosted version", sub: "There is one. It is closed for now.",
    p: [
      "I run a hosted OpenClapper for myself, and I am opening it to selected testers only. The reason is cost, plainly: compute at this scale is cheap, but file storage in the cloud is not, and OpenClapper relies on files of all kinds to keep you inside the ecosystem.",
      "I do not rule out a version everyone can use without self-hosting; quite the opposite, I aim for it. But until I can estimate what running it costs at scale, the hosted version stays closed. If you want to help find out, join the waiting list below.",
    ],
  },
  ideas: {
    h: "Contribute", sub: "Send ideas. Any department, any problem.",
    p: [
      "In the age of AI, most features I can implement myself. What I cannot conjure is your hands-on experience. I am hugely thankful to anyone who takes the time to write down what gets in their way on a shoot.",
      "It does not have to be well written. Brainstorms, half-thoughts, a list of annoyances: anything goes. I sort it out, with AI's help, and make sense of it. If you would like to test the feature once it exists, or be asked questions while it is taking shape, say so and tell me how to reach you, in whatever way you are comfortable with.",
    ],
    language: "Write in English or German, whichever comes easier.",
  },
  waitlist: {
    h: "Tester waiting list", sub: "A way to help the project: test the hosted version as it grows.",
    p: "Testers get access to the hosted version and try new features before they are frozen. Leave your email and I will get in touch when a test round starts. Everything else is optional; it helps me put together a varied group.",
  },
  foot: { privacy: "Privacy", license: "© 2026 OpenClapper · Apache 2.0" },
  form: {
    optional: "optional", required: "required",
    draftRestored: "Your unsent draft was restored.", startOver: "Start over",
    botWait: "The bot check has not finished yet; give it a moment.", botFailed: "The bot check could not load", reload: "Reload the page and try again.",
    more: "A bit more information about you", moreContact: "A bit more information about you and how to reach you",
    system: "Which system did you work in?", systemHelp: "Titles and habits differ; it helps me read your positions right. Click again to clear.", systemAria: "Film system",
    systems: { german: "German", us: "US / International", other: "Other" },
    positions: "Your positions", positionsHelp: "Every role you have worked in; many people have more than one.",
    pick: "Pick positions", add: "Add a position", closeList: "Close the list", filter: "Filter: DP, Gaffer, Aufnahmeleitung…", filterAria: "Filter positions", byDept: "Positions by department",
    noMatch: (q: string) => `No position matches "${q}". Pick "Other" and write it in.`, remove: (p: string) => `Remove ${p}`,
    other: "What is “other”?", otherPh: "Drone pilot, intimacy coordinator…",
    years: "Years in the industry", yearsHelp: "Altogether, across every position.",
    privacy: "Privacy",
  },
  wl: {
    email: "Email", emailHelp: "For the confirmation now and the invite later. Nothing else.", nickname: "First name or nickname",
    submit: "Join the waiting list", fine: "Double opt-in: nothing is kept until you confirm.",
    doneTitle: "One more step: confirm your email", done: (email: string) => `We sent a link to ${email}. Open it within 7 days and you are on the list. No mail? Check the spam folder, then try again in ten minutes.`,
    confirmedTitle: "You are on the list", confirmed: "Thanks for confirming. I will mail you when there is a spot to test.",
    expiredTitle: "That link does not work any more", expired: "It was used already or is older than 7 days. Sign up again below and a fresh one comes right away.",
  },
  rq: {
    n: (i: number) => `Request ${i}`, removeN: (i: number) => `Remove request ${i}`,
    title: "Title", titlePh: "Call sheets on the phone",
    text: "What do you need?", textHelp: "Brainstorm, bullet points, a rant about the last shoot: anything goes. Which department, what went wrong, what would have helped. English or German, as you like.",
    textRequired: "Write what you need; a sentence is enough.",
    test: "I would test this", prototype: "Contact me while shaping this",
    addAnother: "Add another request",
    contact: "How to reach you", contactPh: "@handle on Instagram, or name@example.com",
    contactHelpWants: "You asked to test or be contacted: say how, in your own words. An email, a handle on whatever network, a phone number; whatever you are comfortable with.",
    contactHelp: "Only if you want a reply. An email, a handle, anything; or leave it empty.",
    submit1: "Send the request", submitN: (n: number) => `Send ${n} requests`,
    fine: "No account, no name needed. Drafts stay in this browser until sent.",
    doneTitle1: "Thank you, your request is in", doneTitleN: (n: number) => `Thank you, your ${n} requests are in`, done: "I read every one of them.", another: "Send another",
  },
  privacy: {
    title: "Privacy", home: "Home",
    lede: "This page has no analytics, no advertising and no cookies. It stores only what you type into one of its two forms.",
    hostingH: "Hosting", hosting: "openclapper.org runs on Cloudflare (Cloudflare, Inc.), which serves the page, stores the submissions in a database on its network and sends the one confirmation mail. Like every web server, Cloudflare processes your IP address and request metadata to deliver the page and to keep it reachable, and keeps these in its logs for a short time.",
    botH: "The bot check", bot: "Both forms carry Cloudflare Turnstile, which tells humans and bots apart without a puzzle. It runs in your browser and sends Cloudflare a few signals about the browser and the request, including your IP address. Nothing from the form itself goes into that check.",
    wlH: "The tester waiting list",
    wl1: "Required: your email address. Optional, if you give them: a first name or nickname, the film system you worked in, your positions in the industry and your years of experience.",
    wl2: "The address is used to send you one confirmation mail right away and, later, an invitation to try the hosted version, plus the occasional mail about that test. It is not shared, sold or used for anything else. A sign-up that is not confirmed within seven days is deleted. A confirmed entry stays until you ask for it to be removed.",
    rqH: "Feature requests",
    rq1: "Required: the text of your request. Optional, if you give them: a title per request, the film system you worked in, your positions, your years of experience, whether you would like to test or help shape the feature, and how to contact you in your own words (an email address, a handle, or nothing at all). None of it is linked to an account, and nothing identifies you unless you put it in the text.",
    rq2: "Requests are read by the project's maintainer and kept as long as they are useful for the roadmap. If you asked to be contacted, your contact note is used only for that.",
    storageH: "Your browser's storage", storage: "The theme, the language and an unsent form draft are kept in your browser's local storage, so a draft survives a closed tab. Neither leaves your browser; sending a form clears its draft.",
    rightsH: "Your rights, and how to reach me",
    rights1: "You can ask at any time what is stored about you, have it corrected, or have it deleted: mail", rights2: "Removal from the waiting list is immediate.",
    responsible: "Responsible for this site: the maintainer of OpenClapper. Last updated 2026-10-28.",
  },
};
export type Dict = typeof en;

const de: Dict = {
  nav: { apps: "Die Apps", support: "Support", ideas: "Ideen", waitlist: "Warteliste", theme: "Design", lang: "English", langTitle: "Read in English" },
  hero: {
    status: "Frühe Alpha · selbst gehostet · Open Source",
    title: "Werkzeuge für Filmvorbereitung und Dreh, gebaut von jemandem, der den Job gemacht hat.",
    lede: "OpenClapper organisiert eine Produktion von der ersten Idee bis zum letzten Drehtag, hält das Team auf einem Stand und läuft auf Infrastruktur, die dir gehört. Open Source unter Apache 2.0.",
    join: "Auf die Tester-Warteliste", idea: "Eine Idee einreichen", source: "Quellcode",
  },
  origin: {
    h: "Woher es kommt", sub: "Ein Produktionswerkzeug aus dem Produktionsbüro.",
    p: [
      "Ich habe als 1. Aufnahmeleiter, im amerikanischen System ungefähr ein 2nd AD, Vorbereitung und Dreh kleinerer unabhängiger Projekte begleitet. Ich weiß aus erster Hand, wie schlecht die Werkzeuge sind, um eine Produktion zu organisieren und alle auf einem Stand zu halten: Tabellen, Gruppenchats, PDFs, die beim Ausdrucken schon veraltet sind.",
      "Ich habe die Branche verlassen und bin Vollzeit-Entwickler geworden. Kaum habe ich eigene Hobbyprojekte gedreht, war der Bedarf nach einem Werkzeug für die Drehorganisation sofort wieder da. OpenClapper ist meine Antwort darauf.",
      "Statt Zeit und Geld in ein Nischenwerkzeug zu stecken, das nur ich benutze, will ich eine echte Open-Source-Lösung für die Organisation von Vorbereitung und Dreh bauen.",
    ],
  },
  who: {
    h: "Für wen es ist", sub: "Zuerst kleine Teams. Irgendwann ganze Produktionen. Immer eure eigene Infrastruktur.",
    p: [
      "Die ersten Nutzer sind kleine unabhängige Teams und Solo-Filmemacher. Das Ziel darüber hinaus: Vorbereitung und Dreh komplett abzudecken, auch für größere Produktionen.",
      "Jeder kann das ganze System selbst hosten: eine Filmhochschule, eine kleine Produktionsfirma, ein Ein-Personen-Team. Eure Daten bleiben eure, und die laufenden Kosten bleiben klein.",
      "Es gibt keinen Lock-in. Ein Export aller Daten aus der eigenen Instanz ist geplant, und wer irgendwann zu einem anderen Werkzeug wechseln will oder von einem kommt, dem helfe ich bei der Migration, so gut ich kann.",
    ],
  },
  apps: {
    h: "Das System", sub: "Drei Apps, ein Ganzes.",
    note: "Funktionen werden hier bewusst nicht aufgezählt: Das Projekt ist in der Alpha, viele davon sind vom Arbeitsablauf eines einzelnen Kameramanns geprägt, und sie werden sich ändern und zusammenwachsen, sobald mehr Leute damit arbeiten. Eine ausführliche Liste der unterstützten Abläufe kommt, wenn OpenClapper die Alpha verlässt.",
    cols: { app: "App", platform: "Plattform", what: "Was es ist" },
    web: "Web", phone: "Telefon",
    studio: "Die zentrale Web-Anwendung, in der gearbeitet wird: eine Produktion organisieren und planen.",
    mobile: "Ein leichter Begleiter, der hilft, auf Kurs zu bleiben, eng mit dem Studio verzahnt.",
    admin: "Die Betreiberseite einer Instanz: Benutzer- und Ressourcenverwaltung für alle, die OpenClapper für eine Schule, eine Firma oder ein Team betreiben.",
  },
  support: {
    h: "Stand der Unterstützung", sub: "Was heute wo läuft.",
    browsersTag: "Studio und Admin", browsersH: "Chrome und Chromium-Browser", browsers: "Dringend empfohlen. Andere Browser funktionieren vielleicht, sind aber ungetestet.",
    mobileTag: "Mobile", mobileH: "Android", mobile: "Eine iOS-App ist geplant. Das System soll plattformübergreifend bleiben.", ios: "iOS geplant",
    hostTag: "Selbst hosten", hostH: "Cloudflare und GitHub", host: "Eine Installation läuft auf einem Cloudflare-Konto und wird aus einem GitHub-Repository heraus verwaltet.", why: "Warum diese Dienste?",
    whyTitle: "Warum Cloudflare und GitHub?",
    whyIntro: "Selbst hosten soll eine kleine Firma, eine Filmhochschule oder ein unabhängiges Team zum Start nichts kosten und im Betrieb so wenig wie möglich. Beide Dienste machen das heute möglich.",
    github: "Ein sehr großzügiges kostenloses Kontingent für die Verwaltung einer Installation: Wer selbst hostet, zahlt dafür nichts. Und es ist der De-facto-Standard der Open-Source-Gemeinschaft, in der OpenClapper ohnehin lebt.",
    cloudflare1: "Das umfassendste Angebot an Cloud-Diensten für das, was OpenClapper braucht, in einem Konto: Rechenleistung, eine Datenbank, Dateispeicher, Mail, Zugriffskontrolle. Das kostenlose Kontingent deckt die Rechenleistung ab, der Start kostet also nichts.",
    cloudflare2: "Dateispeicher ist das, wofür ein Produktionswerkzeug Geld ausgibt, und Cloudflares Preise dafür sind mit Abstand die günstigsten unter den Cloud-Anbietern. Zero Trust bringt ohne Aufpreis strenge Zugriffsregeln für die Admin-Seite.",
    bothH: "Beide", both: "Beide werden von LLM-Coding-Agenten sehr gut unterstützt, was das Aufsetzen einer eigenen Instanz vergleichsweise leicht macht, auch ohne Entwickler im Team.",
  },
  alpha: {
    h: "Was Alpha bedeutet", sub: "Frühes Prototyping, täglich im Einsatz, nicht bereit für professionelle Abläufe.",
    p: [
      "OpenClapper ist in der Alpha: einem frühen Prototyping-Stadium. Viele Funktionen gibt es schon, und ich benutze die App viel für meine eigenen Projekte. So wie sie jetzt ist, ist sie für professionellere Abläufe aber keine gute Erfahrung.",
      "Mein Ziel für die Alpha ist eine Grundausstattung an unterstützten Funktionen, abgeleitet aus den Wünschen der Community. Irgendwann friere ich diese Liste ein, baue sie fertig und gebe sie zum Testen frei.",
      "Während der Alpha gibt es keine Garantie auf Abwärtskompatibilität. Wer jetzt selbst hostet und die Updates mitgeht, muss damit rechnen, dass irgendwann Grundlegendes bricht. Das ist die unschöne Realität einer Alpha. Ab dem Beta-Release ist Abwärtskompatibilität garantiert.",
    ],
  },
  maintainer: {
    h: "Ein Maintainer", sub: "Eine Anmerkung zu Zeiträumen.",
    p: [
      "Ich bin eine Person, mit einem Vollzeitjob. Bitte seid realistisch, wie lange es dauert, dieses Projekt ins Laufen zu bringen.",
      "KI beschleunigt enorm, wie schnell ich Funktionen liefern kann. Testen und Prototyping werden dadurch umso wichtiger, und das lässt sich nicht wegautomatisieren. Genau da kommt ihr ins Spiel.",
    ],
  },
  hosted: {
    h: "Die gehostete Version", sub: "Es gibt eine. Sie ist vorerst geschlossen.",
    p: [
      "Ich betreibe ein gehostetes OpenClapper für mich selbst und öffne es nur für ausgewählte Tester. Der Grund sind schlicht die Kosten: Rechenleistung in dieser Größenordnung ist billig, Dateispeicher in der Cloud ist es nicht, und OpenClapper stützt sich auf Dateien aller Art, damit ihr im System bleiben könnt.",
      "Ich schließe eine Version, die alle ohne eigenes Hosting nutzen können, nicht aus; im Gegenteil, ich strebe sie an. Aber solange ich nicht abschätzen kann, was der Betrieb in großem Maßstab kostet, bleibt die gehostete Version geschlossen. Wer helfen will, das herauszufinden, trägt sich unten in die Warteliste ein.",
    ],
  },
  ideas: {
    h: "Mitmachen", sub: "Schickt Ideen. Jedes Department, jedes Problem.",
    p: [
      "Im Zeitalter der KI kann ich die meisten Funktionen selbst umsetzen. Was ich nicht herbeizaubern kann, ist eure Erfahrung aus der Praxis. Ich bin jedem sehr dankbar, der sich die Zeit nimmt aufzuschreiben, was ihm oder ihr am Set im Weg steht.",
      "Es muss nicht gut geschrieben sein. Brainstorms, halbe Gedanken, eine Liste von Ärgernissen: Alles geht. Ich sortiere es, mit Hilfe von KI, und mache etwas daraus. Wer die Funktion testen will, sobald es sie gibt, oder während der Entwicklung Rückfragen beantworten mag, sagt das und schreibt dazu, wie ich Kontakt aufnehmen darf, auf welchem Weg auch immer.",
    ],
    language: "Schreibt auf Deutsch oder Englisch, wie es leichter fällt.",
  },
  waitlist: {
    h: "Tester-Warteliste", sub: "Eine Art, dem Projekt zu helfen: die gehostete Version testen, während sie wächst.",
    p: "Tester bekommen Zugang zur gehosteten Version und probieren neue Funktionen aus, bevor sie eingefroren werden. Hinterlasst eure E-Mail-Adresse, und ich melde mich, wenn eine Testrunde beginnt. Alles andere ist optional; es hilft mir, eine gemischte Gruppe zusammenzustellen.",
  },
  foot: { privacy: "Datenschutz", license: "© 2026 OpenClapper · Apache 2.0" },
  form: {
    optional: "optional", required: "Pflichtfeld",
    draftRestored: "Dein ungesendeter Entwurf wurde wiederhergestellt.", startOver: "Neu anfangen",
    botWait: "Die Bot-Prüfung ist noch nicht fertig; einen Moment bitte.", botFailed: "Die Bot-Prüfung konnte nicht geladen werden", reload: "Lade die Seite neu und versuch es noch einmal.",
    more: "Ein bisschen mehr über dich", moreContact: "Ein bisschen mehr über dich und wie ich dich erreiche",
    system: "In welchem System hast du gearbeitet?", systemHelp: "Bezeichnungen und Gewohnheiten unterscheiden sich; es hilft mir, deine Positionen richtig zu lesen. Noch einmal klicken löscht die Auswahl.", systemAria: "Filmsystem",
    systems: { german: "Deutsch", us: "US / International", other: "Anderes" },
    positions: "Deine Positionen", positionsHelp: "Jede Rolle, in der du gearbeitet hast; viele haben mehr als eine.",
    pick: "Positionen wählen", add: "Position hinzufügen", closeList: "Liste schließen", filter: "Filtern: DP, Gaffer, Aufnahmeleitung…", filterAria: "Positionen filtern", byDept: "Positionen nach Department",
    noMatch: (q: string) => `Keine Position passt zu „${q}“. Wähl „Other“ und schreib sie dazu.`, remove: (p: string) => `${p} entfernen`,
    other: "Was heißt „Other“?", otherPh: "Drohnenpilot, Intimitätskoordination…",
    years: "Jahre in der Branche", yearsHelp: "Insgesamt, über alle Positionen hinweg.",
    privacy: "Datenschutz",
  },
  wl: {
    email: "E-Mail", emailHelp: "Für die Bestätigung jetzt und die Einladung später. Sonst nichts.", nickname: "Vorname oder Spitzname",
    submit: "Auf die Warteliste", fine: "Double Opt-in: Nichts wird gespeichert, bis du bestätigst.",
    doneTitle: "Noch ein Schritt: Bestätige deine E-Mail", done: (email: string) => `Wir haben einen Link an ${email} geschickt. Öffne ihn innerhalb von 7 Tagen, dann stehst du auf der Liste. Keine Mail? Schau in den Spam-Ordner und versuch es in zehn Minuten noch einmal.`,
    confirmedTitle: "Du stehst auf der Liste", confirmed: "Danke fürs Bestätigen. Ich schreibe dir, sobald ein Testplatz frei ist.",
    expiredTitle: "Dieser Link funktioniert nicht mehr", expired: "Er wurde schon benutzt oder ist älter als 7 Tage. Trag dich unten noch einmal ein, dann kommt sofort ein neuer.",
  },
  rq: {
    n: (i: number) => `Wunsch ${i}`, removeN: (i: number) => `Wunsch ${i} entfernen`,
    title: "Titel", titlePh: "Dispo auf dem Handy",
    text: "Was brauchst du?", textHelp: "Brainstorm, Stichpunkte, ein Rant über den letzten Dreh: Alles geht. Welches Department, was schiefging, was geholfen hätte. Deutsch oder Englisch, wie du magst.",
    textRequired: "Schreib, was du brauchst; ein Satz reicht.",
    test: "Das würde ich testen", prototype: "Kontaktiert mich während der Entwicklung",
    addAnother: "Noch einen Wunsch hinzufügen",
    contact: "Wie ich dich erreiche", contactPh: "@handle auf Instagram, oder name@example.com",
    contactHelpWants: "Du möchtest testen oder kontaktiert werden: Sag wie, in deinen Worten. Eine E-Mail-Adresse, ein Handle auf irgendeinem Netzwerk, eine Telefonnummer; womit du dich wohlfühlst.",
    contactHelp: "Nur, wenn du eine Antwort willst. Eine E-Mail-Adresse, ein Handle, irgendwas; oder leer lassen.",
    submit1: "Wunsch abschicken", submitN: (n: number) => `${n} Wünsche abschicken`,
    fine: "Kein Konto, kein Name nötig. Entwürfe bleiben in diesem Browser, bis sie gesendet sind.",
    doneTitle1: "Danke, dein Wunsch ist angekommen", doneTitleN: (n: number) => `Danke, deine ${n} Wünsche sind angekommen`, done: "Ich lese jeden einzelnen.", another: "Noch einen schicken",
  },
  privacy: {
    title: "Datenschutz", home: "Startseite",
    lede: "Diese Seite hat keine Analytics, keine Werbung und keine Cookies. Sie speichert nur, was du in eines ihrer zwei Formulare eingibst.",
    hostingH: "Hosting", hosting: "openclapper.org läuft bei Cloudflare (Cloudflare, Inc.), das die Seite ausliefert, die Formulareingaben in einer Datenbank in seinem Netz speichert und die eine Bestätigungsmail verschickt. Wie jeder Webserver verarbeitet Cloudflare deine IP-Adresse und Anfragedaten, um die Seite auszuliefern und erreichbar zu halten, und behält sie kurze Zeit in seinen Protokollen.",
    botH: "Die Bot-Prüfung", bot: "Beide Formulare tragen Cloudflare Turnstile, das Menschen und Bots ohne Rätsel unterscheidet. Es läuft in deinem Browser und schickt Cloudflare ein paar Signale über Browser und Anfrage, darunter deine IP-Adresse. Nichts aus dem Formular selbst fließt in diese Prüfung ein.",
    wlH: "Die Tester-Warteliste",
    wl1: "Pflicht: deine E-Mail-Adresse. Optional, wenn du sie angibst: ein Vorname oder Spitzname, das Filmsystem, in dem du gearbeitet hast, deine Positionen in der Branche und deine Jahre an Erfahrung.",
    wl2: "Die Adresse wird benutzt, um dir sofort eine Bestätigungsmail zu schicken und später eine Einladung zur gehosteten Version, plus gelegentlich eine Mail zu diesem Test. Sie wird nicht weitergegeben, verkauft oder für anderes verwendet. Eine Anmeldung, die nicht innerhalb von sieben Tagen bestätigt wird, wird gelöscht. Ein bestätigter Eintrag bleibt, bis du um Löschung bittest.",
    rqH: "Feature-Wünsche",
    rq1: "Pflicht: der Text deines Wunsches. Optional, wenn du sie angibst: ein Titel pro Wunsch, das Filmsystem, in dem du gearbeitet hast, deine Positionen, deine Jahre an Erfahrung, ob du die Funktion testen oder mitgestalten möchtest, und wie ich dich erreiche, in deinen Worten (eine E-Mail-Adresse, ein Handle oder gar nichts). Nichts davon ist mit einem Konto verknüpft, und nichts identifiziert dich, außer du schreibst es in den Text.",
    rq2: "Wünsche liest der Maintainer des Projekts; sie bleiben, solange sie für die Planung nützlich sind. Wenn du um Kontakt gebeten hast, wird deine Kontaktangabe nur dafür verwendet.",
    storageH: "Der Speicher deines Browsers", storage: "Design, Sprache und ein ungesendeter Formularentwurf liegen im lokalen Speicher deines Browsers, damit ein Entwurf einen geschlossenen Tab überlebt. Nichts davon verlässt deinen Browser; das Absenden eines Formulars löscht seinen Entwurf.",
    rightsH: "Deine Rechte, und wie du mich erreichst",
    rights1: "Du kannst jederzeit erfragen, was über dich gespeichert ist, es berichtigen oder löschen lassen: Mail an", rights2: "Die Streichung von der Warteliste erfolgt sofort.",
    responsible: "Verantwortlich für diese Seite: der Maintainer von OpenClapper. Zuletzt aktualisiert am 28.10.2026.",
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
export const getLang = () => current;

/** The current dictionary and language as state; re-renders on a switch. */
export function useT(): [Dict, Lang, (l: Lang) => void] {
  const [lang, set] = useState(current);
  useEffect(() => { listeners.add(set); return () => { listeners.delete(set); }; }, []);
  return [DICTS[lang], lang, setLang];
}
