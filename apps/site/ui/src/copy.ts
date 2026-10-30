/**
 * Every string of the page, the forms and the privacy page, in one place, English only (the owner's
 * decision: no localisation; feature requests may still be written in German, the form says so).
 * The page says four things: the goal, where the project stands, the plan, and that everyone is
 * welcome to contribute. It does not describe the current code: the project starts with the community.
 */
export const t = {
  nav: { goal: "The goal", why: "Why", state: "Where it stands", rug: "The rug", plan: "The plan", ideas: "Contribute", waitlist: "Sign up" },
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
    positions: "Your positions", positionsHelp: "Every role you have worked in; many people have more than one.",
    pick: "Pick positions", add: "Add a position", closeList: "Close the list", filter: "Filter: DP, Gaffer, Aufnahmeleitung…", filterAria: "Filter positions", byDept: "Positions by department",
    noMatch: (q: string) => `No position matches "${q}". Pick "Other" and write it in.`, remove: (p: string) => `Remove ${p}`,
    other: "What is “other”?", otherPh: "Drone pilot, intimacy coordinator…",
    years: "Years in the industry", yearsHelp: "Altogether, across every position.", yearsAria: "Years in the industry",
    languages: "Which languages could you test in, or answer questions in?", languagesHelp: "Pick every one that applies.", languagesAria: "Languages",
    otherLanguage: "Which language?", otherLanguagePh: "French, Polish, Turkish…",
    platforms: "Which platforms could you test on?", platformsHelp: "The web client in a browser; the mobile client on Android or iOS.", platformsAria: "Platforms",
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
    storageH: "Your browser's storage", storage: "The theme and an unsent form draft are kept in your browser's local storage, so a draft survives a closed tab. Neither leaves your browser; sending a form clears its draft.",
    rightsH: "Your rights, and how to reach me",
    rights1: "You can ask at any time what is stored about you, have it corrected, or have it deleted: mail", rights2: "Removal from the list is immediate.",
    responsible: "Responsible for this site: the maintainer of OpenClapper. Last updated 2026-10-30.",
  },
};
