
import { Flow, User, RoleMapping } from './types.ts';

export const TEAM_MEMBERS: User[] = [
  { 
    id: 'u8', 
    name: 'Admin Systému', 
    email: 'admin@testfirma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin123&backgroundColor=c0aede', 
    role: 'Administrátor',
    role_key: 'ADMIN',
    isAdmin: true 
  },
  { 
    id: 'u1', 
    name: 'Mojmír Trtík', 
    email: 'obchodnik-zdivo@testfirma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf', 
    role: 'Obchodník Zdivo',
    role_key: 'OBCHODNIK_ZDIVO',
    isAdmin: false
  },
  { 
    id: 'u10', 
    name: 'Jan Novák', 
    email: 'obchodnik-fasady@testfirma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pete&backgroundColor=ffdfbf', 
    role: 'Obchodník Fasády & ETICS',
    role_key: 'OBCHODNIK_FASADY',
    isAdmin: false
  },
  { 
    id: 'u11', 
    name: 'Petra Krátká', 
    email: 'obchodnik-sdk@testfirma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liza&backgroundColor=ffdfbf', 
    role: 'Obchodník Sádrokartony',
    role_key: 'OBCHODNIK_SDK',
    isAdmin: false
  },
  { 
    id: 'u5', 
    name: 'Eva Malá', 
    email: 'reditel@testfirma.cz', 
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?clothingGraphic=bat,bear,cumbia&mouth=serious&skinColor=edb98a&top=longButNotTooLong&seed=Robert', 
    role: 'Ředitel pobočky',
    role_key: 'REDITEL_POBOCKY',
    isAdmin: false
  },
  { 
    id: 'u2', 
    name: 'Petr Dvořák', 
    email: 'pm-sdk@testfirma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=ffdfbf', 
    role: 'PM Sádrokartony',
    role_key: 'PM_SADROKARTON'
  },
  { 
    id: 'u6', 
    name: 'Lucie Bílá', 
    email: 'pm-izolace@testfirma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liza&backgroundColor=c0aede', 
    role: 'PM Izolace & Fasády',
    role_key: 'PM_IZOLACE'
  },
  { 
    id: 'u7', 
    name: 'Bořek Stavitel', 
    email: 'pm-zdivo@testfirma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=ffdfbf', 
    role: 'PM Zdivo & Beton',
    role_key: 'PM_ZDIVOBETON'
  },
  { 
    id: 'u9', 
    name: 'Čestmír Strakatý', 
    email: 'provozni@firma.cz', 
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cestmir&backgroundColor=b6e3f4', 
    role: 'Provozní technik',
    role_key: 'PROVOZNI_TECHNIK'
  },
];

export const INITIAL_MAPPINGS: RoleMapping[] = [
  { 
    id: 'm1', 
    role: 'PM Sádrokartony', 
    groups: [
      { name: 'Strategie a Nákup', keywords: ['nákupní ceny sdk', 'objektová sleva sádrokarton', 'podmínky Knauf', 'podmínky Rigips', 'marže sdk', 'podržet cenu', 'garance nákupky', 'vzorkování sdk'] }
    ]
  },
  { 
    id: 'm2', 
    role: 'PM Izolace & Fasády', 
    groups: [
      { name: 'Strategie a Nákup', keywords: ['nákupka polystyren', 'speciální cena vata', 'vyjednat u výrobce fasády', 'objektovka izolace', 'vzorkovník omítek', 'expedice výrobce fasády', 'podmínky Weber'] }
    ]
  },
  { 
    id: 'm7', 
    role: 'PM Zdivo & Beton', 
    groups: [
      { name: 'Strategie a Nákup', keywords: ['velkoobjemová sleva zdivo', 'nákupní podmínky výrobce cihly', 'nákupka porotherm', 'objektová cena beton', 'Wienerberger sleva', 'logistika expedice výrobce', 'kapacita výroby'] }
    ]
  },
  { 
    id: 'm4', 
    role: 'Obchodník Zdivo', 
    groups: [
      { name: 'Prodej a Nabídky', keywords: ['nabídka cihly', 'nacenění porotherm', 'kalkulace heluz', 'poptávka zdivo', 'zaměření stavby'] },
      { name: 'Aktivity', keywords: ['štiky', 'schůzky', 'CRM hlášení', 'plnění plánu', 'výkaz práce'] }
    ]
  },
  { 
    id: 'm8', 
    role: 'Obchodník Fasády & ETICS', 
    groups: [
      { name: 'Prodej a Nabídky', keywords: ['nabídka fasáda', 'nacenit zateplení', 'kalkulace omítky', 'etics nabídka', 'zaměření fasády'] },
      { name: 'Aktivity', keywords: ['štiky', 'schůzky', 'CRM', 'plnění'] }
    ]
  },
  { 
    id: 'm9', 
    role: 'Obchodník Sádrokartony', 
    groups: [
      { name: 'Prodej a Nabídky', keywords: ['nabídka sdk', 'nacenit podhledy', 'kalkulace příčky', 'suchá výstavba nabídka'] },
      { name: 'Aktivity', keywords: ['štiky', 'schůzky', 'CRM', 'reporty'] }
    ]
  },
  { 
    id: 'm5', 
    role: 'Provozní technik', 
    groups: [
      { name: 'Výpočty a Technika', keywords: ['výpočet spotřeby', 'matematika spotřeby', 'výkaz výměr ETICS', 'výpočet cihel', 'spotřeba materiálu', 'technické řešení stavby'] },
      { name: 'Budova a Revize', keywords: ['oprava', 'revize', 'závada na pobočce', 'údržba areálu', 'elektřina', 'kotel', 'vytápění', 'nájem'] }
    ]
  },
  { 
    id: 'm6', 
    role: 'Ředitel pobočky', 
    groups: [
      { name: 'Management', keywords: ['stížnost', 'personální věci', 'porada pobočky', 'delegování úkolů', 'kontrola docházky'] },
      { name: 'Reporting', keywords: ['celkové štiky', 'souhrn schůzek', 'výsledky pobočky', 'plnění obchodníků'] }
    ]
  },
];

export const INITIAL_FLOWS: Flow[] = [];

export const CONSTRUCTION_FACTS = [
  "Beton je po vodě nejpoužívanější látkou na celé planetě.",
  "První sádrokarton (SDK) byl vynalezen v roce 1894 v USA.",
  "Ředitel pobočky v DEKu má na starosti průměrně 15–30 lidí.",
  "Beton při tvrdnutí uvolňuje teplo.",
  "Ocelová výztuž zvyšuje pevnost betonu v tahu.",
  "Zateplením střechy lze výrazně snížit únik tepla z domu.",
  "Asfalt se pokládá při vysoké teplotě, aby byl tvárný.",
  "Cihly se vyrábějí vypalováním hlíny v peci.",
  "Nosník přenáší zatížení mezi sloupy.",
  "Hydroizolace chrání stavbu před vlhkostí.",
  "Dřevostavby mají rychlejší dobu výstavby než zděné domy.",
  "Tepelné mosty zvyšují energetickou náročnost budovy.",
  "Základová deska rozkládá hmotnost stavby do podloží.",
  "Lešení musí splňovat přísné bezpečnostní normy.",
  "Rekuperace snižuje tepelné ztráty při větrání.",
  "Prefabrikované dílce zkracují čas výstavby.",
  "Stavební deník je povinnou součástí většiny staveb.",
  "BIM umožňuje digitální řízení celého stavebního projektu.",
  "Okna s trojsklem mají lepší izolační vlastnosti.",
  "Armovaný beton kombinuje pevnost betonu a oceli.",
  "Střešní krytina chrání objekt před povětrnostními vlivy.",
  "Cement se vyrábí z vápence a dalších příměsí.",
  "Objemová hmotnost materiálu ovlivňuje zatížení konstrukce.",
  "Objektová sleva se u velkých staveb vyjednává individuálně pro každý projekt."
];
