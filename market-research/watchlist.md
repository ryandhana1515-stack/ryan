# Watchlist — The AI Buildout Stack

Six themes covering the physical build-out of AI: chips → the machines that
make chips → power → cooling/water → networking → the buildings themselves.
Qualitative descriptions only; **no figures from memory** — the daily brief
searches and cites current numbers.

Legend: 🟢 established (profitable, proven business) · 🟡 profitable but
cyclical or in transition · 🔴 SPECULATIVE (pre-revenue, pre-profit, or
unproven tech)

---

## 1. AI chips & compute

| Ticker | Company | What they actually sell | Who buys it |
|---|---|---|---|
| NVDA 🟢 | Nvidia | GPUs/accelerators for AI training & inference, plus the CUDA software stack and full server racks | Hyperscalers (Microsoft, Google, Amazon, Meta), AI labs, sovereign/enterprise data centers |
| AMD 🟢 | Advanced Micro Devices | Instinct AI accelerators, EPYC server CPUs, Ryzen PC chips | Hyperscalers, AI labs (notably OpenAI/Oracle deals), PC makers |
| AVGO 🟢 | Broadcom | Custom AI chips (ASICs) designed with customers, networking silicon, infrastructure software (VMware) | Google (TPU), Meta, other hyperscalers designing their own chips |
| MRVL 🟡 | Marvell | Custom AI silicon, electro-optics, data-center interconnect chips | Amazon, Microsoft, other cloud providers |
| INTC 🟡 | Intel | x86 CPUs, Gaudi AI accelerators, and a foundry business trying to win external customers | PC makers, server buyers; foundry seeks chip designers as customers |
| ARM 🟢 | Arm Holdings | Licenses CPU architecture designs; royalty per chip shipped | Apple, Qualcomm, Nvidia (Grace CPU), nearly every smartphone maker |
| MU 🟡 | Micron | Memory chips — DRAM, NAND, and HBM (high-bandwidth memory that sits next to AI GPUs) | Nvidia, AMD, server and phone makers |

Not listed on NYSE/NASDAQ (tracked as context only): SK Hynix (HBM leader,
Korea), Samsung (Korea), Huawei/Ascend (private, China).

## 2. Semiconductor equipment & foundries

| Ticker | Company | What they actually sell | Who buys it |
|---|---|---|---|
| TSM 🟢 | TSMC (ADR) | Contract chip manufacturing — makes the chips others design; leading-edge nodes and advanced packaging (CoWoS) | Nvidia, AMD, Apple, Broadcom, Qualcomm |
| ASML 🟢 | ASML (ADR) | Lithography machines, incl. EUV — the only company on earth selling the machines that print leading-edge chips | TSMC, Samsung, Intel, memory makers |
| AMAT 🟢 | Applied Materials | Deposition, etch, and inspection equipment across most chipmaking steps | All major foundries and memory fabs |
| LRCX 🟢 | Lam Research | Etch and deposition tools, strong in memory/HBM manufacturing steps | TSMC, Samsung, SK Hynix, Micron |
| KLAC 🟢 | KLA | Inspection & metrology — finds defects during chipmaking | All major fabs |
| GFS 🟡 | GlobalFoundries | Contract manufacturing on mature (non-leading-edge) nodes | Auto, IoT, comms chip designers |

## 3. Data center power — utilities, grid equipment, generation

| Ticker | Company | What they actually sell | Who buys it |
|---|---|---|---|
| CEG 🟢 | Constellation Energy | Electricity from the largest US nuclear fleet; signs long-term deals with data centers | Microsoft (Three Mile Island restart deal), utilities, businesses |
| VST 🟢 | Vistra | Electricity from gas + nuclear + solar fleet in competitive markets (Texas etc.) | Wholesale power markets, data-center offtake deals |
| TLN 🟢 | Talen Energy | Nuclear + gas generation; sells power to an AWS data-center campus | Amazon, wholesale markets |
| NRG 🟢 | NRG Energy | Gas generation + retail electricity; data-center power partnerships | Retail customers, wholesale markets, data centers |
| GEV 🟢 | GE Vernova | Gas turbines, grid equipment, wind — the machines that generate and move power | Utilities, independent power producers, data-center developers |
| ETN 🟢 | Eaton | Electrical switchgear, UPS, power distribution inside data centers | Data-center builders, industrial customers |
| PWR 🟢 | Quanta Services | Construction crews that build transmission lines and substations | Utilities, renewable developers |
| VRT 🟢 | Vertiv | Power management AND cooling for data centers (spans themes 3 & 4) | Hyperscalers, colocation providers |
| OKLO 🔴 | Oklo | SPECULATIVE — small modular reactor (SMR) developer; no operating reactor, no revenue from power yet | Signed non-binding agreements with data-center developers |
| SMR 🔴 | NuScale Power | SPECULATIVE — only SMR design with US NRC approval, but no plant built; pre-profit | Utility consortiums, international prospects |

## 4. Water & cooling

| Ticker | Company | What they actually sell | Who buys it |
|---|---|---|---|
| VRT 🟢 | Vertiv | Precision cooling (incl. liquid cooling) + power gear for data centers | Hyperscalers, colocation, enterprises |
| MOD 🟢 | Modine | Data-center cooling units (Airedale brand), heat-transfer products | Data-center operators, HVAC market, auto |
| NVT 🟢 | nVent Electric | Liquid-cooling systems, electrical enclosures and connection gear | Data centers, industrial, utilities |
| JCI 🟢 | Johnson Controls | Large-scale HVAC, chillers (York), building controls | Commercial buildings, data centers |
| XYL 🟢 | Xylem | Water pumps, treatment, and analytics — moving and treating the water itself | Utilities, industry, some data-center use |
| ECL 🟢 | Ecolab | Water treatment chemistry & services, incl. reducing data-center water use | Industry, hospitality, data centers |

## 5. Networking & interconnect

| Ticker | Company | What they actually sell | Who buys it |
|---|---|---|---|
| ANET 🟢 | Arista Networks | High-speed Ethernet switches + network software for AI clusters | Microsoft, Meta (top customers), other clouds/enterprises |
| AVGO 🟢 | Broadcom | Switch/router silicon (Tomahawk, Jericho) inside everyone's networking gear | Networking equipment makers, hyperscalers |
| MRVL 🟡 | Marvell | Optical interconnect (electro-optics) and DSPs linking racks together | Cloud providers, networking OEMs |
| CRDO 🟢 | Credo | Active electrical cables + SerDes chips for short in-rack connections | Hyperscalers (customer-concentrated) |
| ALAB 🟡 | Astera Labs | Connectivity chips (retimers, smart cable modules) between GPUs, CPUs, memory | Nvidia-ecosystem server builders, hyperscalers |
| COHR 🟡 | Coherent | Optical transceivers (the lasers that carry data between racks) | Cloud providers, networking OEMs |
| CIEN 🟢 | Ciena | Optical transport gear connecting data centers to each other over distance | Telecoms, hyperscalers |
| FN 🟢 | Fabrinet | Contract manufacturing of optical modules (builds what others design) | Nvidia, Cisco, optical vendors |

## 6. Data center REITs

| Ticker | Company | What they actually sell | Who buys it |
|---|---|---|---|
| EQIX 🟢 | Equinix | Colocation space + interconnection (the "meet-me rooms" of the internet); REIT | Enterprises, clouds, networks — 10k+ customers |
| DLR 🟢 | Digital Realty | Wholesale + colocation data-center space; REIT | Hyperscalers, large enterprises |
| IRM 🟢 | Iron Mountain | Records storage legacy business + growing data-center arm; REIT | Enterprises, government, cloud tenants |

Context only (not directly investable on NYSE/NASDAQ): Vantage, QTS,
Switch — large private data-center operators.

## Crypto (tracked, not a theme)

BTC and ETH always; plus the top-20 by market cap as listed on a major
tracker (CoinGecko/CoinMarketCap) at the time of each brief. Crypto trades
24/7, so weekend moves get covered in Monday briefs.

---

## Deep-dive rotation tracker

Order: NVDA → TSM → CEG → VRT → ANET → EQIX → AMD → ASML → VST → MOD →
AVGO → EQIX-alt(DLR) → MU → LRCX → GEV → NVT → MRVL → IRM → ARM → AMAT →
TLN → XYL → CRDO → OKLO → INTC → KLAC → ETN → JCI → ALAB → BTC → GFS →
PWR → ECL → COHR → ETH → NRG → CIEN → FN → SMR — then restart.

| Date | Company covered |
|---|---|
| 2026-08-03 | NVDA |
| 2026-08-05 | TSM |
