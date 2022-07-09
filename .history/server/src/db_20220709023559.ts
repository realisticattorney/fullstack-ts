import * as low from 'lowdb';
import * as FileSync from 'lowdb/adapters/FileSync';
import { v4 as uuid } from 'uuid';

export interface DbEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DbTweet extends DbEntity {
  message: string;
  userId: string;
}

export interface DbUser extends DbEntity {
  id: string;
  avatarUrl: string;
  handle: string;
  name: string;
  coverUrl: string;
}

export interface DbFavorite extends DbEntity {
  tweetId: string;
  userId: string;
}

export interface DbHashtagTrend {
  id: string;
  kind: 'hashtag';
  hashtag: string;
  tweetCount: number;
}
export interface DbTopicTrendQuote {
  id: string;
  topicTrendId: string;
  title: string;
  description: string;
  imageUrl: string;
}
export interface DbTopicTrend {
  id: string;
  kind: 'topic';
  topic: string;
  tweetCount: number;
  quote?: DbTopicTrendQuote;
}
export type DbTrend = DbTopicTrend | DbHashtagTrend;
export interface DbSuggestion {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  reason: string;
}

export interface DbSchema {
  tweets: DbTweet[];
  users: DbUser[];
  favorites: DbFavorite[];
  hashtagTrends: DbHashtagTrend[];
  suggestions: DbSuggestion[];
  topicTrends: DbTopicTrend[];
  topicTrendQuotes: DbTopicTrendQuote[];
}

class Db {
  private adapter;
  private db;

  constructor(filePath: string) {
    this.adapter = new FileSync<DbSchema>(filePath);
    this.db = low(this.adapter);
    this.db.read();
  }
  async initDefaults() {
    return await this.db
      .defaults<DbSchema>({
        tweets: [],
        users: [],
        favorites: [],
        hashtagTrends: [],
        topicTrends: [],
        topicTrendQuotes: [],
        suggestions: [],
      })
      .write();
  }

  getFirstUser(): DbUser {
    const firstUser = this.db.get('users').first().value();
    if (!firstUser) throw new Error('No users in database');
    return firstUser;
  }

  getUserById(id: string) {
    return this.db
      .get('users')
      .find((u) => u.id === id)
      .value();
  }
  getTweetById(id: string) {
    return this.db
      .get('tweets')
      .find((t) => t.id === id)
      .value();
  }
  getUserTweets(userId: string) {
    return this.db
      .get('tweets')
      .filter((t) => t.userId === userId)
      .value();
  }
  getUserFavorites(userId: string) {
    return this.db
      .get('favorites')
      .filter((f) => f.userId === userId)
      .value();
  }

  getAllTweets(): DbTweet[] {
    return this.db
      .get('tweets')
      .sortBy((t) => new Date(t.createdAt).valueOf())
      .reverse()
      .value();
  }

  getAllFavorites(): DbFavorite[] {
    return this.db.get('favorites').value();
  }

  getAllTrends(): DbTrend[] {
    const hashTrends = this.db.get('hashtagTrends').reverse().value();
    const topicTrends = this.db.get('topicTrends').reverse().value();
    const topicTrendQuotes = this.db
      .get('topicTrendQuotes')
      .reverse()
      .value()
      .reduce((acc, item) => {
        acc[item.topicTrendId] = item;
        return acc;
      }, {} as Record<string, DbTopicTrendQuote>);

    const list = [
      ...hashTrends,
      ...topicTrends.map((tt) => {
        const quote = topicTrendQuotes[tt.id];
        return { ...tt, quote };
      }),
    ].sort((a, b) => b.tweetCount - a.tweetCount);
    return list;
  }

  getAllSuggestions() {
    return this.db.get('suggestions').value();
  }

  getFavoritesForTweet(tweetId: string): DbFavorite[] {
    return this.db
      .get('favorites')
      .filter((t) => t.tweetId === tweetId)
      .value();
  }
  getFavoriteCountForTweet(tweetId: string): number {
    return this.getFavoritesForTweet(tweetId).length;
  }
  async createSuggestion(
    trendProps: Pick<DbSuggestion, 'avatarUrl' | 'handle' | 'name' | 'reason'>
  ): Promise<DbSuggestion> {
    const suggestions = this.db.get('suggestions');
    const newSuggestion: DbSuggestion = {
      ...trendProps,
      id: `suggestion-${uuid()}`,
    };
    await suggestions.push(newSuggestion).write();
    return newSuggestion;
  }
  async createHashtagTrend(
    trendProps: Pick<DbHashtagTrend, 'tweetCount' | 'hashtag'>
  ): Promise<DbHashtagTrend> {
    const hashtagTrends = this.db.get('hashtagTrends');
    const newTrend: DbHashtagTrend = {
      ...trendProps,
      kind: 'hashtag',
      id: `hashtrend-${uuid()}`,
    };
    await hashtagTrends.push(newTrend).write();
    return newTrend;
  }
  async createTopicTrend(
    trendProps: Pick<DbTopicTrend, 'topic' | 'tweetCount'>,
    quoteProps?: Pick<DbTopicTrendQuote, 'title' | 'imageUrl' | 'description'>
  ): Promise<DbTopicTrend> {
    const topicTrends = this.db.get('topicTrends');
    const newTrend: DbTopicTrend = {
      ...trendProps,
      kind: 'topic',
      id: `topictrend-${uuid()}`,
    };
    await topicTrends.push(newTrend).write();
    if (quoteProps) {
      const { title, description, imageUrl } = quoteProps;
      const topicTrendQuotes = this.db.get('topicTrendQuotes');
      const newQuote: DbTopicTrendQuote = {
        ...trendProps,
        title,
        description,
        imageUrl,
        topicTrendId: newTrend.id,
        id: `topictrendquote-${uuid()}`,
      };
      await topicTrendQuotes.push(newQuote).write();
    }
    return newTrend;
  }

  async createTweet(
    tweetProps: Pick<DbTweet, 'message' | 'userId'>
  ): Promise<DbTweet> {
    const tweets = this.db.get('tweets');
    const tweet: DbTweet = {
      ...tweetProps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: `tweet-${uuid()}`,
    };
    await tweets.push(tweet).write();
    return tweet;
  }

  async createUser(
    userProps: Pick<DbUser, 'name' | 'handle' | 'avatarUrl' | 'coverUrl'>
  ): Promise<DbUser> {
    const users = this.db.get('users');
    const user: DbUser = {
      ...userProps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: `user-${uuid()}`,
    };
    await users.push(user).write();
    return user;
  }

  async createFavorite(
    favoriteProps: Pick<DbFavorite, 'tweetId' | 'userId'>
  ): Promise<DbFavorite> {
    const user = this.getUserById(favoriteProps.userId);
    const tweet = this.getTweetById(favoriteProps.tweetId);
    if (!user) throw new Error('User does not exist');
    if (!tweet) throw new Error('Tweet does not exist');
    const favorites = this.db.get('favorites');
    const favorite: DbFavorite = {
      ...favoriteProps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: `favorite-${uuid()}`,
    };
    await favorites.push(favorite).write();
    return favorite;
  }
  async deleteFavorite(
    favoriteProps: Pick<DbFavorite, 'tweetId' | 'userId'>
  ): Promise<DbFavorite> {
    const user = this.getUserById(favoriteProps.userId);
    const tweet = this.getTweetById(favoriteProps.tweetId);
    if (!user) throw new Error('User does not exist');
    if (!tweet) throw new Error('Tweet does not exist');
    const favorites = this.db.get('favorites');

    const deleted = favorites.remove(
      (f) => f.tweetId === tweet.id && f.userId === user.id
    );

    await this.db.write();
    return deleted.first().value();
  }

  hasUser(predicate: (user: DbUser) => boolean): boolean {
    return !!this.db.get('users').find(predicate);
  }

  getAllUsers(): DbUser[] {
    return this.db.get('users').value();
  }

  async write(): Promise<void> {
    await this.db.write();
  }
}

export default Db;




https://stackoverflow.com/questions/29820791/git-ignore-node-modules-folder-everywhere | node modules - Git - Ignore node_modules folder everywhere - Stack Overflow
https://stackoverflow.com/questions/27150926/unable-to-access-git-attributes | Unable to access 'git/attributes' - Stack Overflow
https://github.com/realisticattorney/ubuntu-server-node | realisticattorney/ubuntu-server-node
http://freeminder.tech:3000/ | freeminder.tech:3000
https://frontendmasters.com/courses/fullstack-v2/defining-http/ | Defining HTTP - Full Stack for Front-End Engineers, v2
https://frontendmasters.com/courses/ | Learn JavaScript, Front-End Web Development and Node.js with Frontend Masters Courses
https://frontendmasters.com/courses/enterprise-patterns/ | Learn patterns in JavaScript and TypeScript for coding large, enterprise applications in this course by Lukas Ruebbelke.
https://frontendmasters.com/courses/advanced-async-js/ | Learn How Is Javascript Asynchronous? | Frontend Masters
https://frontendmasters.com/courses/pure-react-state/setstate-class/ | setState & Class - State Management in Pure React, v2
https://en.wikipedia.org/wiki/SOLID | SOLID - Wikipedia
https://frontendmasters.com/learn/node-js/ | Node.js Learning Path – Build Web APIs and Applications with Node.js
https://frontendmasters.com/courses/digging-into-node/introduction/ | Introduction - Digging Into Node.js
https://frontendmasters.com/courses/fullstack-v2/http-headers-cookies/ | HTTP Headers & Cookies - Full Stack for Front-End Engineers, v2
https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages | HTTP Messages - HTTP | MDN
http://huergo.edu.ar/docs/programas/computacion/plansuperiorcomputadoras2019.pdf | plansuperiorcomputadoras2019.pdf
https://nodejs.org/api/fs.html | File system | Node.js v18.4.0 Documentation
https://beta.reactjs.org/learn/thinking-in-react | Thinking in React
https://www.typescriptlang.org/docs/handbook/type-inference.html | TypeScript: Documentation - Type Inference
https://www.reddit.com/r/reactjs/comments/j2la5p/here_is_how_to_access_kent_dodds_359_epic_react/ | Here is how to access Kent Dodds' $359 Epic React course repositories : reactjs
https://github.com/kentcdodds/react-fundamentals | kentcdodds/react-fundamentals: Material for my React Fundamentals Workshop
http://localhost:3000/2 | 2. useEffect: persistent state | React Hooks 🎣
https://babeljs.io/repl#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=App&corejs=3.21&spec=false&loose=false&code_lz=MYewdgzgLgBArgSxgXhgHgCYIG4D40QAOAhmLgBICmANtSGgPRGm7rNkDqIATtRo-3wMseAFCiYkqRKmSZsyQDM4YYFATgYAWUoQIxAOaUALAApC3EIQgBKGAG95U7pShxuYdCJjBqxPQByxAC2lMgARKF6hpThuPYWVhAAdMAAFgh8LmAAvowiuE454gowomg60UbGPhlZlGARlfrVMABG3HBp4TAMrFJAA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=true&targets=&version=7.18.7&externalPlugins=&assumptions=%7B%7D | Babel · The compiler for next generation JavaScript
https://reactjs.org/docs/introducing-jsx.html#embedding-expressions-in-jsx | Introducing JSX – React
http://localhost:3001/4 | 4. Creating custom components | React Fundamentals ⚛
https://beta.reactjs.org/learn/adding-interactivity | Adding Interactivity
https://beta.reactjs.org/learn/managing-state | Managing State
https://keep.google.com/#home | Google Keep
http://csbin.io/promises | CS Bin
https://frontendmasters.com/courses/server-graphql-nodejs/introduction/ | Introduction - Server-Side GraphQL in Node.js
https://frontendmasters.com/courses/fullstack-typescript/transforming-data/ | Transforming Data - Fullstack TypeScript (feat. GraphQL & Node.js)
https://www.typescript-training.com/course/full-stack-typescript/05-first-resolver/ | First Resolver | Learn TypeScript w/ Mike North
https://www.apollographql.com/docs/react/get-started/ | Get started with Apollo Client - Apollo GraphQL Docs
https://www.apollographql.com/docs/react/api/core/ApolloClient/ | class ApolloClient - Apollo GraphQL Docs
https://www.linkedin.com/skill-assessments/Linux/quiz-intro/ | (13) LinkedIn
https://www.youtube.com/ | YouTube
https://mail.google.com/mail/u/0/#inbox | Inbox (1,763) - g.axl.aquila@gmail.com - Gmail
https://twitter.com/home | Home / Twitter

https://codesandbox.io/s/simple-counter-forked-phbgkn?file=/src/Counter.js | simple-counter (forked) - CodeSandbox
https://keep.google.com/#NOTE/16pLz9Qz4dKWTJC5iJIWV54q7Bn9qtV-xzeG7dqguok5Zk8oHf5Zh4MDyTHwQavY | Google Keep
http://csbin.io/closures | CS Bin

https://studio.apollographql.com/sandbox/explorer | Explorer | Sandbox | Studio
https://github.com/settings/tokens | Personal access tokens
http://127.0.0.1:5500/?name=dgagag
https://controlpanel.tech/servlet/ViewDomainServlet?orderid=97627567&referrerkey=VzcvVDBSSlVsTkpKZXlZWHdLQ0RKVmxGaHlVckJaS1dZT0xvbzhSVlJ0MjRkaTBUYUk5d0NRPT0=# | Manage freeminder.tech
http://freeminder.tech/
https://cloud.digitalocean.com/projects/8ceddbe3-0a8b-48a7-bf80-531824955ba6/resources?i=9bb92d | first-project project - DigitalOcean

https://www.focusmate.com/session/1656648900 | 7:42 until start - Focusmate

https://frontendmasters.com/courses/pure-react-state/ | React State Management | Pure React Course | Frontend Masters
https://www.preethikasireddy.com/post/the-architecture-of-a-web-3-0-application | The Architecture of a Web 3.0 application
http://www.paulgraham.com/avg.html | Beating the Averages
https://docs.ethers.io/v5/api/providers/types/#providers-TransactionRequest | Types
https://codesandbox.io/s/rainbowkit-typescript-app-forked-p97td0?file=/src/App.tsx | rainbowkit-typescript-app (forked) - CodeSandbox
https://developer.offchainlabs.com/docs/developer_quickstart | Arbitrum Developer Quickstart · Offchain Labs Dev Center
https://developer.offchainlabs.com/docs/public_testnet | Public Testnet Guide · Offchain Labs Dev Center
https://github.com/realisticattorney/DexFi-NextJS/blob/master/components/MenuPanel.js | DexFi-NextJS/MenuPanel.js at master · realisticattorney/DexFi-NextJS
https://wagmi.sh/docs/hooks/useSendTransaction | useSendTransaction – wagmi
https://github.com/with-backed/backed-interface/blob/f025208809b209f4c42547a315eaaab60f980712/components/CreatePageHeader/CreatePageForm.tsx | backed-interface/CreatePageForm.tsx at f025208809b209f4c42547a315eaaab60f980712 · with-backed/backed-interface
https://github.com/descartes100/Dapp-frontend-wagmi/blob/main/src/App.tsx | Dapp-frontend-wagmi/App.tsx at main · descartes100/Dapp-frontend-wagmi
https://docs.ethers.io/v5/api/contract/example/#example-erc-20-contract--connecting-to-a-contract | Example: ERC-20 Contract
https://github.com/danielivert/dyor/blob/main/apps/frontend/src/features/test-contract/useTestContract.ts | dyor/useTestContract.ts at main · danielivert/dyor
https://github.com/orca-so/typescript-sdk | orca-so/typescript-sdk: The Orca SDK contains a set of simple to use APIs to allow developers to integrate with the Orca exchange platform.

https://beta.openai.com/playground | Playground - OpenAI API

https://cloud.digitalocean.com/droplets/new?fleetUuid=45f63526-4586-40a0-9afe-b78221cfa15a&i=421153&size=s-4vcpu-8gb&region=ams3 | Create Droplets - DigitalOcean
https://cloud.digitalocean.com/welcome?i=9bb92d | Welcome - DigitalOcean
https://cloud.digitalocean.com/projects/8ceddbe3-0a8b-48a7-bf80-531824955ba6/resources?dropletIsCreating=true&i=9bb92d | first-project project - DigitalOcean

https://www.cloudflare.com/learning/access-management/authn-vs-authz/ | Authn vs. authz: How are they different? | Cloudflare
https://en.wikipedia.org/wiki/Cross-site_scripting | Cross-site scripting - Wikipedia
https://www.google.com/search?q=exfil&oq=exfil&aqs=chrome..69i57j46i10i131i199i433i465j0i512j0i10i131i433j0i512j0i10i433j0i10i131i433j0i512j0i10i433.2252j0j7&sourceid=chrome&ie=UTF-8 | exfil - Google Search
https://en.wikipedia.org/wiki/Qt_(software) | Qt (software) - Wikipedia
https://en.wikipedia.org/wiki/Cross-site_request_forgery | Cross-site request forgery - Wikipedia
https://www.google.com/search?q=osint&oq=OSINT&aqs=chrome.0.0i433i512j0i131i433i512j0i433i512j0i10i512j0i512l2j0i131i433i512j0i433i512j0i512j0i131i433i512.147j0j7&sourceid=chrome&ie=UTF-8 | osint - Google Search
https://studio.apollographql.com/sandbox/explorer | Explorer | Sandbox | Studio
https://www.ingenieria.unam.mx/dcsyhfi/material_didactico/Literatura_Hispanoamericana_Contemporanea/Autores_B/BORGES/babi.pdf | baba

https://webpack.js.org/guides/getting-started/ | Getting Started | webpack
https://webpack.js.org/configuration/watch/#watch | Watch and WatchOptions | webpack
http://csbin.io/async | CS Bin
https://frontendmasters.com/courses/cypress/test-runner-overview/ | Test Runner Overview - Testing Web Apps with Cypress
https://frontendmasters.com/courses/react-typescript/higher-order-components/ | Higher Order Components - React and TypeScript
https://angel.co/company/portex/jobs/968879-lead-frontend-engineer | Lead Frontend Engineer at Portex • San Francisco Bay Area • Remote (Work from Home) | AngelList Talent
https://angel.co/company/violet-protocol/jobs/2168147-senior-frontend-engineer | Senior Frontend Engineer at Violet • Europe • Remote (Work from Home) | AngelList Talent
https://angel.co/company/soar-14/jobs/2163477-web-developer | Web Developer at Soar • Los Angeles • New York City • San Francisco • Remote (Work from Home) | AngelList Talent
https://angel.co/company/mapistry/jobs/1850579-senior-software-engineer-javascript-typescript-full-stack | Senior Software Engineer - Javascript/Typescript Full Stack at Mapistry • Berkeley • Remote (Work from Home) | AngelList Talent
https://angel.co/company/launch-house/jobs/1868422-web3-engineer | Web3 Engineer at launch house • Los Angeles • New York City • San Francisco • Remote (Work from Home) | AngelList Talent
https://angel.co/company/heard-mental-health/jobs/2192013-senior-fullstack-engineer-expansion | Senior Fullstack Engineer — Expansion at Heard Mental Health • San Francisco • Seattle • Remote (Work from Home) | AngelList Talent
https://angel.co/company/truthfools/jobs/2145403-front-end-engineer | Front End Engineer at Truthfools • New York City • San Francisco • Austin • Remote (Work from Home) | AngelList Talent
https://angel.co/company/hirosystems/jobs/1243738-senior-frontend-engineer-user-experience | Senior Frontend Engineer, User Experience at Hiro • New York City • New York • Remote • Remote (Work from Home) | AngelList Talent
https://angel.co/jobs/applications | Job Applications | AngelList Talent
https://docs.google.com/document/d/12rAZLQoQz7kpFIs3qK9gsBm8e3s8xc9vWKBypvs22mI/edit | FRONT END - Google Docs
https://beta.openai.com/playground | Playground - OpenAI API
https://www.loom.com/share/f05577f36eef4edb8bb76a8df9fe5d9c | DEX walkthrough

https://frontendmasters.com/courses/ | Learn JavaScript, Front-End Web Development and Node.js with Frontend Masters Courses
https://frontendmasters.com/courses/web-development-v2/server-routing-with-express/ | Server Routing with Express - Complete Intro to Web Development, v2
https://frontendmasters.com/courses/complete-react-v7/introduction/ | Introduction - Complete Intro to React, v7
https://btholt.github.io/complete-intro-to-react-v7/ | Complete Intro to React v7
https://frontendmasters.com/courses/functional-first-steps/ | What is Functional Programming? | Learn Functional Programming Course
https://frontendmasters.com/courses/interviewing-frontend/giving-evaluating-a-code-test/ | Giving & Evaluating a Code Test - Interviewing for Front-End Engineers
https://frontendmasters.com/courses/getting-a-job/ | Learn how to get a front-end developer job from an expert who has helped over 250 people land their first developer jobs.
https://frontendmasters.com/courses/react-typescript/higher-order-components/ | Higher Order Components - React and TypeScript
https://codedamn.com/learn/github-actions-ci-cd | CI/CD With GitHub Actions | codedamn
http://localhost:3000/compliment | localhost:3000/compliment
https://mail.google.com/mail/u/0/#inbox/FMfcgzGpFqSzDQZLvKWQdlctxfjvHDvb | Invitation: HR of German Aquila for the position Hireterra - Middle/S... @ Tue May 10, 2022 10am - 10:20am (ART) (g.axl.aquila@gmail.com) - g.axl.aquila@gmail.com - Gmail
https://svitla.com/career/middlesenior-full-stack-developer-with-react-node-and-nextjs-2022-04-20-05-09 | MIDDLE/SENIOR FULL STACK DEVELOPER (WITH REACT, NODE, AND NEXT.JS)

https://www.youtube.com/watch?v=VsUzmlZfYNg&list=LL&index=2&t=606s | Build and Deploy a Full Stack MERN Social Media App with Auth, Pagination, Comments | MERN Course - YouTube
https://github.com/adrianhajdin/project_mern_memories/blob/PART_1_and_2/client/src/reducers/posts.js | project_mern_memories/posts.js at PART_1_and_2 · adrianhajdin/project_mern_memories
https://www.restapitutorial.com/httpstatuscodes.html | HTTP Status Codes
http://localhost:3000/
https://www.frontendinterviewhandbook.com/javascript-questions#can-you-describe-the-main-difference-between-a-foreach-loop-and-a-map-loop-and-why-you-would-pick-one-versus-the-other | JavaScript questions | Front End Interview Handbook
https://en.wikipedia.org/wiki/Cross-origin_resource_sharing | Cross-origin resource sharing - Wikipedia
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind | Function.prototype.bind() - JavaScript | MDN
https://www.prl.one/jobs/front-end-engineer | Senior Front-end Engineer
https://production-grade-nextjs.vercel.app/lesson/07-auth-with-jwt | https://production-grade-nextjs.vercel.app/lesson/07-auth-with-jwt
https://github.com/Hendrixer/production-grade-nextjs/blob/production/pages/api/auth/%5B...nextauth%5D.ts | production-grade-nextjs/[...nextauth].ts at production · Hendrixer/production-grade-nextjs
https://frontendmasters.com/courses/typescript-v3/arrays-tuples/ | Learn Arrays & Tuples – TypeScript Fundamentals, v3
https://frontendmasters.com/courses/cypress/continuous-integration/ | Continuous Integration - Testing Web Apps with Cypress
https://frontendmasters.com/courses/hardcore-js-v2/parsing-weather-api-data-into-html/ | Learn Parsing Weather API Data into HTML – Hardcore Functional Programming in JavaScript, v2
https://frontendmasters.com/courses/interviewing-frontend/ | Learn to Pass Front-end Interviews | Recruiter Prescreen Questions
https://github.com/stevekinney/react-and-typescript-projects | stevekinney/react-and-typescript-projects
https://frontendmasters.com/courses/testing-practices-principles/test-factories-colocating-tests-q-a/ | Test Factories & Colocating Tests Q&A - JavaScript Testing Practices and Principles
https://jestjs.io/ | Jest · 🃏 Delightful JavaScript Testing
https://frontendmasters.com/courses/web3-smart-contracts/signers-waiting-for-transactions/ | Signers & Waiting for Transactions - A Tour of Web 3: Ethereum & Smart Contracts with Solidity
https://theprimeagen.github.io/web3-smart-contracts/your-first-contract#jokes-on-you | Your First Contract – Getting our feet wet – A Tour of Web3's Ethereum.
https://beta.openai.com/playground | Playground - OpenAI API
https://docs.google.com/document/d/1o8k0XnvXUQaSYOuKD2V1ljGHc1bhIM3BZoTr0PAmnJY/edit | Interviewer:What's your experience with automated integrations - Google Docs
https://github.dev/realisticattorney/DexFi-NextJS/tree/master | [Preview] README.md — DexFi-NextJS [GitHub] — Visual Studio Code — GitHub
https://button.foundation/financial-primitives | Financial Primitives
https://www.youtube.com/watch?v=Ehm-OYBmlPM&t=1s | UNISWAP V3 - New Era Of AMMs? Architecture Explained - YouTube
https://www.youtube.com/watch?v=QxoqPZRw9y4&list=PLjrTIwaNiTwn39tg3sR_bPBWGHoznv47D&index=28 | Derivatives in DEFI Explained (Synthetix, UMA, Hegic, Opyn, Perpetual, dYdX, BarnBridge) - YouTube
https://www.youtube.com/watch?v=Ia0DVfRJKy8&list=PLjrTIwaNiTwn39tg3sR_bPBWGHoznv47D&index=34 | The TRUTH About DEFI - YouTube
https://frontendmasters.com/courses/intermediate-react-v4/usereducer/ | Learn useReducer – Intermediate React, v4
http://localhost:1234/
https://frontendmasters.com/courses/react-typescript/typing-children-exercise/ | Learn Typing Children Exercise – React and TypeScript
https://andrecronje.medium.com/ve-3-3-44466eaa088b | ve(3,3). Quick article to explain how a… | by Andre Cronje | Medium
http://localhost:3000/notes
https://hendrixer.github.io/nextjs-course/fetching-data | Fetching Data – Data Fetching – Intro to Next.js
https://keep.google.com/#NOTE/16pLz9Qz4dKWTJC5iJIWV54q7Bn9qtV-xzeG7dqguok5Zk8oHf5Zh4MDyTHwQavY | Google Keep
http://localhost:3000/app | localhost:3000/app
https://frontendmasters.com/workshops/fullstack-typescript/ | Full-Stack TypeScript (feat. Node.js, React and GraphQL) Online Workshop
https://frontendmasters.com/courses/pure-react-state/ | React State Management | Pure React Course | Frontend Masters
https://frontendmasters.com/courses/webpack-plugins/ | Learn to Build Custom Webpack Plugins to Extend Webpack
https://frontendmasters.com/courses/webpack-fundamentals/ | Learn Webpack 4 with Sean Larkin | Webpack File Loader
https://frontendmasters.com/courses/sass/preprocesser-benefits/ | Preprocesser Benefits - Sass Fundamentals
https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/basic-algorithm-scripting/mutations | Basic Algorithm Scripting: Mutations | freeCodeCamp.org
http://csbin.io/closures | CS Bin
https://frontendmasters.com/courses/production-next/auth-callback-session-data/ | Auth Callback Session Data - Production-Grade Next.js
https://swr.vercel.app/ | React Hooks for Data Fetching – SWR
https://github.com/vercel/next.js/discussions/22276 | What is a technical definition of "hydration" within NextJS? · Discussion #22276 · vercel/next.js
https://www.youtube.com/watch?v=7YhdqIR2Yzo&list=LL&index=1&t=51s | How Does React Actually Work? React.js Deep Dive #1 - YouTube
https://github.com/realisticattorney/DexFi-NextJS/tree/master | realisticattorney/DexFi-NextJS
https://github.dev/realisticattorney/DexFi-NextJS | MenuPanel.js — DexFi-NextJS [GitHub] — Visual Studio Code — GitHub

https://www.youtube.com/ | YouTube
https://dev.to/carlomigueldy/unit-testing-a-solidity-smart-contract-using-chai-mocha-with-typescript-3gcj | Unit Testing a Solidity Smart Contract using Chai & Mocha with TypeScript - DEV Community
https://docs.google.com/document/d/1NXyXfYCs4MJ4ALJYQZunHs4kWwgWOC-kJaU-ML0NUZI/edit | 2022/04/21 19:02 - Thu Apr 21 7:02 pm - German / Matt - Google Docs
https://www.konfinity.com/What-is-mocha-chai-testing? | What is mocha chai testing?| Konfinity
https://itnext.io/how-to-make-tests-using-chai-and-mocha-e9db7d8d48bc | How to make tests using chai and mocha? | by Sam Barros | ITNEXT
https://www.google.com/search?q=Fiddlekins&oq=Fiddlekins&aqs=chrome..69i57j0i13i433j0i13l3j69i60l3.465j0j4&sourceid=chrome&ie=UTF-8 | Fiddlekins - Google Search
https://www.google.com/search?q=Fiddlekins&sxsrf=APq-WBs-VHTVzGwX0DmYZVXwb5Qpao30Bg:1650587628289&ei=7PdhYq6pEe-E1sQP_PCwoAM&start=20&sa=N&ved=2ahUKEwiuz4SKtqb3AhVvgpUCHXw4DDQ4ChDw0wN6BAgBEEY&biw=647&bih=801&dpr=2.5 | Fiddlekins - Google Search
https://www.reddit.com/user/fiddlekins/ | fiddlekins (u/fiddlekins) - Reddit
https://twitter.com/ButtonDeFi | Buttonwood Foundation (@ButtonDeFi) / Twitter
https://docs.prl.one/buttonwood/learn/untitled | Tranche - Buttonwood
https://app.mooncake.prl.one/borrow | MoonCake
https://twitter.com/prl_one | Prometheus Research Labs (@prl_one) / Twitter
https://docs.prl.one/buttonwood/ | Buttonwood - Buttonwood
https://dune.com/prl/Mooncake-Markets | Mooncake Markets
https://mooncake.prl.one/ | MoonCake
https://www.prl.one/resources | PRL: Resources
https://www.prl.one/resources/guides/short-defi-beginner | PRL's short guide to DeFi
https://www.prl.one/resources/guides/personal-opsec | Personal OPSEC
https://www.prl.one/resources/guides/defi-beginner | The Beginner's Beginner Guide to DeFi
https://www.prl.one/jobs/front-end-engineer | Senior Front-end Engineer
https://cryptocurrencyjobs.co/design/prometheus-research-labs-ux-designer/ | UX Designer at Prometheus Research Labs - Cryptocurrency Jobs
https://github.com/Fiddlekins/ampl-graph | Fiddlekins/ampl-graph
https://reqexperts.com/wp-content/uploads/2016/04/Wheatcraft-Interfaces-061511.pdf | Microsoft Word - Wheatcraft Interfaces 061511.docx
https://www.google.com/search?q=prometheus+labs+mooncake&oq=prometheus+labs+mooncake&aqs=chrome..69i57j33i160.12443j0j7&sourceid=chrome&ie=UTF-8 | prometheus labs mooncake - Google Search
https://twitter.com/MarkToda | Mark Toda (@MarkToda) / Twitter
https://twitter.com/SocksNFlops | Socks And Flops (@SocksNFlops) / Twitter
https://twitter.com/0xAndyJSON/status/1514277856196628492 | 0xAndyJSON on Twitter: "@evankuo @AmpleforthOrg @saylor As penance @saylor should read the @AmpleforthOrg white paper and this answer from Satoshi in 2009 https://t.co/5wSRV0i2kS https://t.co/ElwSIMRTS7" / Twitter
https://devpost.com/software/hourglass-q86rzw | HourGlass- Financial derivatives to stratify Time Preference | Devpost
https://www.google.com/search?q=prometheus+research+labs+github+mooncake&sxsrf=APq-WBt1Q_8fRGK76j4wJ2aBd947LW5Deg:1650593649187&tbm=isch&source=iu&ictx=1&vet=1&fir=CrQkCIDhqC8HcM%252CS3UG_Bik3yaLCM%252C_%253BR49t6lJlcwYKBM%252C-SfnxpiuJhqhVM%252C_%253Ba6ogF1hkIiMw-M%252CdHZAXBNqkoy0zM%252C_%253BxOJ-GfVvkSjfvM%252C0UaiiSflxYGQqM%252C_%253BRGOcHsseWLtK2M%252CNDee8IWC5eXLoM%252C_%253BpQwoAYUsgqKLgM%252CNDee8IWC5eXLoM%252C_%253BHasTqiXFTpVkUM%252C0UaiiSflxYGQqM%252C_%253BTOmvByV0MNH3SM%252CdHZAXBNqkoy0zM%252C_%253B_zb-VjCqW8FrCM%252CNDee8IWC5eXLoM%252C_%253Bu5vNpLjBRSaK2M%252CNDee8IWC5eXLoM%252C_&usg=AI4_-kSdnbb5NOjepUWBdh703eHTJ5Ro2w&sa=X&ved=2ahUKEwiJ64LBzKb3AhV5hJUCHRvKCT4Q9QF6BAgrEAE#imgrc=R49t6lJlcwYKBM | prometheus research labs github mooncake - Google Search
https://github.com/Fiddlekins?tab=overview&from=2022-02-01&to=2022-02-28 | Fiddlekins / February 2022
https://github.com/aalavandhan/marz-resources/blob/main/frontend/src/contexts/Web3Context.tsx | marz-resources/Web3Context.tsx at main · aalavandhan/marz-resources
https://ampltools.com/ | AMPL Tools
