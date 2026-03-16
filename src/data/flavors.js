// Chalo Artisan Ice Cream — Flavor Data
// All liquid measurements in fl oz (or ml where recipe specifies ml — converted notes inline)
// All dry goods in grams
// 1 quart = 2 pints | each batch yields exactly 1 quart

// Source categories:
//   "uht_ok"       — shelf-stable, can buy anytime
//   "fresh_only"   — must buy within 2 days of churn, spoilage warning on shopping list
//   "pantry"       — dry goods/shelf-stable
//   "specialty"    — Indian grocery / specialty store
//   "produce"      — fresh produce
//   "from_make_ahead" — drawn from a make_ahead component; not purchased, not on shopping list

// Known unit costs (used for cost estimation when filled in)
export const UNIT_COSTS = {
  whole_milk: { cost: 6.49, unit_size: 64, unit: "fl_oz" },       // $6.49 per 64 fl oz
  heavy_cream: { cost: 6.99, unit_size: 32, unit: "fl_oz" },      // $6.99 per 32 fl oz
  cream_cheese: { cost: 3.99, unit_size: 226, unit: "g" },        // $3.99 per 226g
  honeydew_flesh: { cost: 3.99, unit_size: 1400, unit: "g" },     // $3.99 per melon (~1400g usable)
  honey: { cost: 5.89, unit_size: 340, unit: "g" },               // $5.89 per 340g
};

export const FLAVORS = [
  // ─────────────────────────────────────────────────────────────────
  // SHIMLA — Matcha honeydew, lime, toasted rice crunch
  // Timeline: 2 days
  // ─────────────────────────────────────────────────────────────────
  {
    id: "shimla",
    name: "Shimla",
    city: "Shimla",
    descriptor: "Honeydew · Genmaicha · Cucumber Jalapeño",
    timeline_days: 2,
    components: [
      {
        id: "shimla_base",
        name: "Base",
        day: 2,
        make_ahead: false,
        ingredients: [
          {
            id: "shimla_base_whole_milk",
            name: "Whole milk",
            amount_per_quart: 12,
            unit: "fl_oz",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_heavy_cream",
            name: "Heavy cream",
            amount_per_quart: 16,
            unit: "fl_oz",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_sugar",
            name: "Sugar",
            amount_per_quart: 110,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_honey",
            name: "Honey",
            amount_per_quart: 45,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: "Replaces corn syrup",
          },
          {
            id: "shimla_base_cornstarch",
            name: "Cornstarch",
            amount_per_quart: 16,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_matcha",
            name: "Matcha powder",
            amount_per_quart: 1,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_cream_cheese",
            name: "Cream cheese",
            amount_per_quart: 42,
            unit: "g",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_salt",
            name: "Salt",
            amount_per_quart: 1,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_genmaicha",
            name: "Genmaicha tea",
            amount_per_quart: 5,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_base_lime_zest",
            name: "Lime zest",
            amount_per_quart: 3,
            unit: "g",
            source: "produce",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
      {
        id: "shimla_honeydew_concentrate",
        name: "Honeydew concentrate",
        day: 1,
        make_ahead: false,
        ingredients: [
          {
            id: "shimla_hd_flesh_conc",
            name: "Honeydew flesh",
            amount_per_quart: 200,
            unit: "g",
            source: "produce",
            cost_per_unit: null,
            notes: null,
            total_hint: "1 melon yields ~900g usable flesh",
          },
        ],
      },
      {
        id: "shimla_sorbet_swirl",
        name: "Sorbet swirl",
        day: 1,
        make_ahead: false,
        ingredients: [
          {
            id: "shimla_sorbet_flesh",
            name: "Honeydew flesh",
            amount_per_quart: 280,
            unit: "g",
            source: "produce",
            cost_per_unit: null,
            notes: null,
            total_hint: "1 melon yields ~900g usable flesh",
          },
          {
            id: "shimla_sorbet_sugar",
            name: "Sugar",
            amount_per_quart: 37,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_sorbet_lime_juice",
            name: "Lime juice",
            // Recipe: 7ml → 0.24 fl oz
            amount_per_quart: 0.24,
            unit: "fl_oz",
            source: "produce",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
      {
        id: "shimla_cuke_jalapeno_syrup",
        name: "Cucumber jalapeño syrup",
        day: 1,
        make_ahead: false,
        ingredients: [
          {
            id: "shimla_syrup_water",
            name: "Water",
            // Recipe: 120ml → 4.1 fl oz
            amount_per_quart: 4.1,
            unit: "fl_oz",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_syrup_sugar",
            name: "Sugar",
            amount_per_quart: 100,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_syrup_jalapeno",
            name: "Jalapeño",
            amount_per_quart: 40,
            unit: "g",
            source: "produce",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_syrup_cucumber",
            name: "Cucumber",
            amount_per_quart: 60,
            unit: "g",
            source: "produce",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
      {
        id: "shimla_toasted_rice_crunch",
        name: "Toasted rice crunch",
        day: 2,
        make_ahead: false,
        ingredients: [
          {
            id: "shimla_rice",
            name: "Short-grain rice",
            amount_per_quart: 30,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_rice_butter",
            name: "Butter",
            amount_per_quart: 5,
            unit: "g",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "shimla_rice_salt",
            name: "Flaky salt",
            amount_per_quart: 1,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────
  // CALCUTTA — Chai, honey milk jam, fudge ripple
  // Timeline: 3 days (milk jam & masala blend can be made well ahead)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "calcutta",
    name: "Calcutta",
    city: "Calcutta",
    descriptor: "Chai · Honey Milk Jam · Brown Butter Tahini Fudge",
    timeline_days: 3,
    components: [
      {
        // ── MAKE-AHEAD COMPONENT ──────────────────────────────────────
        // Scaled independently (one grind session). Not tied to the
        // production schedule. Reference via source: "from_make_ahead"
        // in consuming components.
        id: "calcutta_chai_masala",
        name: "Chai masala blend",
        make_ahead: true,
        batch_makes: "85g",   // 30+20+10+10+10+5
        keeps: "4 months",
        ingredients: [
          {
            id: "calcutta_masala_cardamom",
            name: "Cardamom pods",
            amount_per_batch: 30,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: "Buy at Indian grocery",
          },
          {
            id: "calcutta_masala_cinnamon",
            name: "Cinnamon sticks",
            amount_per_batch: 20,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: "Buy at Indian grocery",
          },
          {
            id: "calcutta_masala_cloves",
            name: "Cloves",
            amount_per_batch: 10,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: "Buy at Indian grocery",
          },
          {
            id: "calcutta_masala_pepper",
            name: "Black peppercorns",
            amount_per_batch: 10,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_masala_ginger",
            name: "Dried ginger",
            amount_per_batch: 10,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_masala_fennel",
            name: "Fennel seeds",
            amount_per_batch: 5,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
      {
        // ── MAKE-AHEAD COMPONENT ──────────────────────────────────────
        // One pot per session; UHT milk is fine. Not tied to the
        // production schedule. Reference via source: "from_make_ahead"
        // in consuming components.
        id: "calcutta_honey_milk_jam",
        name: "Honey milk jam",
        make_ahead: true,
        batch_makes: "~285g",  // approximate yield after reduction (1L milk → ~275–300g)
        keeps: "3 weeks",
        uht_ok: true,          // whole milk in this component can be UHT
        ingredients: [
          {
            id: "calcutta_hmj_milk",
            name: "Whole milk",
            // Recipe: 1000ml → 33.8 fl oz
            amount_per_batch: 33.8,
            unit: "fl_oz",
            source: "uht_ok",
            cost_per_unit: null,
            notes: "UHT milk is fine; buy anytime",
          },
          {
            id: "calcutta_hmj_sugar",
            name: "Sugar",
            amount_per_batch: 100,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_hmj_honey",
            name: "Honey",
            amount_per_batch: 170,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_hmj_baking_soda",
            name: "Baking soda",
            amount_per_batch: 1,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_hmj_salt",
            name: "Salt",
            amount_per_batch: 1,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
      {
        id: "calcutta_chai_base",
        name: "Chai base",
        day: 2,
        make_ahead: false,
        ingredients: [
          {
            id: "calcutta_base_milk",
            // 560ml ≈ 18.9 fl oz
            name: "Whole milk",
            amount_per_quart: 18.9,
            unit: "fl_oz",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_base_cream",
            // 300ml ≈ 10.1 fl oz
            name: "Heavy cream",
            amount_per_quart: 10.1,
            unit: "fl_oz",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_base_hmj",
            name: "Honey milk jam (from jam)",
            amount_per_quart: 200,
            unit: "g",
            source: "from_make_ahead",
            from_component: "calcutta_honey_milk_jam",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_base_honey",
            name: "Honey",
            amount_per_quart: 40,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: "Replaces corn syrup",
          },
          {
            id: "calcutta_base_cornstarch",
            name: "Cornstarch",
            amount_per_quart: 12,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_base_cream_cheese",
            name: "Cream cheese",
            amount_per_quart: 45,
            unit: "g",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_base_wagh_bakri",
            name: "Wagh Bakri tea",
            amount_per_quart: 10,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: "Buy at Indian grocery; non-substitutable",
          },
          {
            id: "calcutta_base_masala",
            name: "Chai masala (from blend)",
            amount_per_quart: 6,
            unit: "g",
            source: "from_make_ahead",
            from_component: "calcutta_chai_masala",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_base_salt",
            name: "Salt",
            amount_per_quart: 3,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
      {
        id: "calcutta_fudge_ripple",
        name: "Fudge ripple",
        day: 3,
        make_ahead: false,
        ingredients: [
          {
            id: "calcutta_fudge_butter",
            name: "Butter",
            amount_per_quart: 30,
            unit: "g",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_fudge_chocolate",
            name: "Dark chocolate",
            amount_per_quart: 60,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_fudge_tahini",
            name: "Tahini",
            amount_per_quart: 60,
            unit: "g",
            source: "specialty",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_fudge_corn_syrup",
            name: "Corn syrup",
            amount_per_quart: 60,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: "Non-substitutable — do not replace with honey",
          },
          {
            id: "calcutta_fudge_sugar",
            name: "Sugar",
            amount_per_quart: 30,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_fudge_cream",
            // 15ml ≈ 0.5 fl oz
            name: "Heavy cream",
            amount_per_quart: 0.5,
            unit: "fl_oz",
            source: "fresh_only",
            cost_per_unit: null,
            notes: null,
          },
          {
            id: "calcutta_fudge_salt",
            name: "Salt",
            amount_per_quart: 1,
            unit: "g",
            source: "pantry",
            cost_per_unit: null,
            notes: null,
          },
        ],
      },
    ],
  },
];

// ─── Convenience lookups ──────────────────────────────────────────────────────

export const FLAVOR_MAP = Object.fromEntries(FLAVORS.map((f) => [f.id, f]));

// Sourcing groups used for shopping list output order
export const SOURCING_GROUPS = [
  {
    id: "fresh_only",
    label: "Fresh dairy",
    sublabel: "Buy the day before churn",
    warning: "Spoilage risk — do not buy more than 2 days before use",
  },
  {
    id: "uht_ok",
    label: "UHT / shelf-stable dairy",
    sublabel: "Can buy anytime",
    warning: null,
  },
  {
    id: "produce",
    label: "Produce",
    sublabel: null,
    warning: null,
  },
  {
    id: "specialty",
    label: "Specialty",
    sublabel: "Indian grocery or specialty store",
    warning: null,
  },
  {
    id: "pantry",
    label: "Pantry",
    sublabel: null,
    warning: null,
  },
];

export const BULK_DAIRY_THRESHOLD_PINTS = 16;
export const BULK_DAIRY_NOTE =
  "Consider Costco or Smart & Final Eagle Rock for bulk dairy savings";
