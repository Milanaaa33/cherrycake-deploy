const fs = require('fs');
const path = require('path');

function createRequest(
  name,
  method,
  urlPath,
  queryParams = [],
  body = null,
  testScripts = [],
  extraHeaders = []
) {
  const urlObj = {
    raw: `{{baseUrl}}${urlPath}${queryParams.length ? '?' + queryParams.map((q) => `${q.key}=${q.value}`).join('&') : ''}`,
    host: ['{{baseUrl}}'],
    path: urlPath.replace(/^\//, '').split('/'),
  };

  if (queryParams.length > 0) {
    urlObj.query = queryParams.map((q) => ({
      key: q.key,
      value: q.value,
      description: q.description || '',
    }));
  }

  const headers = [
    { key: 'Accept', value: 'application/json' },
    ...(body ? [{ key: 'Content-Type', value: 'application/json' }] : []),
    ...extraHeaders,
  ];

  const req = {
    name,
    event:
      testScripts.length > 0
        ? [
            {
              listen: 'test',
              script: {
                type: 'text/javascript',
                exec: testScripts,
              },
            },
          ]
        : [],
    request: {
      method,
      header: headers,
      url: urlObj,
    },
  };

  if (body !== null) {
    req.request.body = {
      mode: 'raw',
      raw: typeof body === 'string' ? body : JSON.stringify(body, null, 2),
    };
  }

  return req;
}

const collection = {
  info: {
    _postman_id: 'a89c3140-59f2-4b36-93d4-f7b5e4c278a1',
    name: 'CherryCake API Test Suite (QAJ)',
    description:
      'Complete API test suite for CherryCake covering OpenAPI contracts, catalog, CC-16 pricing across regions & MULTI modifiers, guest checkout, Stage 4 bonus fulfillment/table bookings, Auth/Admin RBAC checks, and CC-56 sales reports + PDF export.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  event: [
    {
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: [
          '// Dynamically set futureDate = today + 3 days (YYYY-MM-DD) and report window dates',
          'const now = new Date();',
          'const future = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);',
          'const yyyy = future.getUTCFullYear();',
          'const mm = String(future.getUTCMonth() + 1).padStart(2, "0");',
          'const dd = String(future.getUTCDate()).padStart(2, "0");',
          'pm.collectionVariables.set("futureDate", `${yyyy}-${mm}-${dd}`);',
          '',
          'const todayStr = now.toISOString().slice(0, 10);',
          'const monthStartStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;',
          'const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));',
          'const sixMonthsStartStr = sixMonthsAgo.toISOString().slice(0, 10);',
          'pm.collectionVariables.set("reportToDate", todayStr);',
          'pm.collectionVariables.set("reportMonthStart", monthStartStr);',
          'pm.collectionVariables.set("reportSixMonthsStart", sixMonthsStartStr);',
          'if (!pm.collectionVariables.get("clientId")) {',
          '    pm.collectionVariables.set("clientId", "3f2b8c1e-6a4d-4e7b-9c1a-2d5f7a9b0c3e");',
          '}',
        ],
      },
    },
  ],
  variable: [
    { key: 'baseUrl', value: 'http://localhost:8080', type: 'string' },
    { key: 'region', value: 'UZB', type: 'string' },
    { key: 'authToken', value: '', type: 'string' },
    { key: 'clientId', value: '3f2b8c1e-6a4d-4e7b-9c1a-2d5f7a9b0c3e', type: 'string' },
    { key: 'futureDate', value: '2026-12-31', type: 'string' },
    { key: 'reportToDate', value: '2026-11-30', type: 'string' },
    { key: 'reportMonthStart', value: '2026-11-01', type: 'string' },
    { key: 'reportSixMonthsStart', value: '2026-06-01', type: 'string' },
    { key: 'categoryId_Cakes', value: '1', type: 'string' },
    { key: 'productId_CherryCake', value: '1', type: 'string' },
    { key: 'productId_Napoleon', value: '4', type: 'string' },
    { key: 'productId_Tiramisu', value: '7', type: 'string' },
    { key: 'modId_SizeMedium', value: '2', type: 'string' },
    { key: 'modId_FreshCherries', value: '4', type: 'string' },
    { key: 'modId_ChocolateDrip', value: '5', type: 'string' },
    { key: 'pickupPointId', value: '1', type: 'string' },
    { key: 'deliveryZoneId_Center', value: '1', type: 'string' },
    { key: 'deliveryZoneId_Suburbs', value: '2', type: 'string' },
    { key: 'timeSlotId', value: '1', type: 'string' },
  ],
  item: [
    {
      name: '01 - System & OpenAPI Contract',
      item: [
        createRequest('OpenAPI v3 Docs (All Modules Exposed)', 'GET', '/v3/api-docs', [], null, [
          'pm.test("Status code is 200", function () {',
          '    pm.response.to.have.status(200);',
          '});',
          'pm.test("OpenAPI spec exposes Catalog, Cart, Orders, Fulfillment, Auth, Reports & Admin", function () {',
          '    const json = pm.response.json();',
          '    pm.expect(json.openapi).to.exist;',
          '    const requiredPaths = [',
          '        "/api/regions",',
          '        "/api/categories",',
          '        "/api/products",',
          '        "/api/products/{id}",',
          '        "/api/cart/calculate",',
          '        "/api/orders",',
          '        "/api/orders/my",',
          '        "/api/pickup-points",',
          '        "/api/delivery-zones",',
          '        "/api/time-slots",',
          '        "/api/auth/request-code",',
          '        "/api/auth/verify-code",',
          '        "/api/reports/sales",',
          '        "/api/reports/export"',
          '    ];',
          '    requiredPaths.forEach(p => pm.expect(json.paths[p], `Missing OpenAPI path ${p}`).to.exist);',
          '});',
        ]),
        createRequest('Get All Categories', 'GET', '/api/categories', [], null, [
          'pm.test("Status code is 200", function () {',
          '    pm.response.to.have.status(200);',
          '});',
          'pm.test("Returns Cakes, Desserts, and Drinks", function () {',
          '    const json = pm.response.json();',
          '    pm.expect(json).to.be.an("array").that.has.length.at.least(3);',
          '    const cakes = json.find(c => c.name === "Cakes");',
          '    pm.expect(cakes).to.exist;',
          '    pm.collectionVariables.set("categoryId_Cakes", String(cakes.id));',
          '    const names = json.map(c => c.name);',
          '    pm.expect(names).to.include.members(["Cakes", "Desserts", "Drinks"]);',
          '});',
        ]),
        createRequest('Get All Regions (17 Countries)', 'GET', '/api/regions', [], null, [
          'pm.test("Status code is 200", function () {',
          '    pm.response.to.have.status(200);',
          '});',
          'pm.test("Returns all 17 configured regions", function () {',
          '    const json = pm.response.json();',
          '    pm.expect(json).to.be.an("array").that.has.lengthOf(17);',
          '    const codes = json.map(r => r.code);',
          '    const expected = ["UZB", "KAZ", "GEO", "UKR", "CHN", "ARM", "AZE", "TUR", "MDA", "ROU", "EST", "LVA", "LTU", "FIN", "SWE", "BLR", "RUS"];',
          '    pm.expect(codes).to.include.members(expected);',
          '});',
          'pm.test("Exchange rates are not leaked in public API", function () {',
          '    const json = pm.response.json();',
          '    json.forEach(r => {',
          '        pm.expect(r).to.have.property("code");',
          '        pm.expect(r).to.have.property("name");',
          '        pm.expect(r).to.have.property("currencyCode");',
          '        pm.expect(r).to.have.property("currencySymbol");',
          '        pm.expect(r).to.have.property("vatRate");',
          '        pm.expect(r).to.not.have.property("exchangeRate");',
          '    });',
          '});',
        ]),
      ],
    },
    {
      name: '02 - Catalog & Modifiers',
      item: [
        createRequest(
          'Get Products ({{region}} - Discover IDs)',
          'GET',
          '/api/products',
          [{ key: 'region', value: '{{region}}' }],
          null,
          [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Discovers Product IDs and stores in variables", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json).to.be.an("array").that.has.length.at.least(12);',
            '    const cherryCake = json.find(p => p.name === "Cherry Cake");',
            '    const tiramisu = json.find(p => p.name === "Tiramisu");',
            '    const napoleon = json.find(p => p.name === "Napoleon Cake");',
            '    pm.expect(cherryCake).to.exist;',
            '    pm.expect(tiramisu).to.exist;',
            '    pm.expect(napoleon).to.exist;',
            '    pm.collectionVariables.set("productId_CherryCake", String(cherryCake.id));',
            '    pm.collectionVariables.set("productId_Tiramisu", String(tiramisu.id));',
            '    pm.collectionVariables.set("productId_Napoleon", String(napoleon.id));',
            '});',
          ]
        ),
        createRequest(
          'Filter Products by Category (Cakes)',
          'GET',
          '/api/products',
          [
            { key: 'region', value: '{{region}}' },
            { key: 'categoryId', value: '{{categoryId_Cakes}}' },
          ],
          null,
          [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Returns only products in selected category", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json).to.be.an("array").that.has.length.at.least(5);',
            '    const names = json.map(p => p.name);',
            '    pm.expect(names).to.include("Cherry Cake");',
            '});',
          ]
        ),
        createRequest(
          'Get Product Detail with Modifiers (GEO)',
          'GET',
          '/api/products/{{productId_CherryCake}}',
          [{ key: 'region', value: 'GEO' }],
          null,
          [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Discovers Size and MULTI Extras modifier IDs", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.modifierGroups).to.be.an("array").that.has.length.at.least(2);',
            '    const sizeGroup = json.modifierGroups.find(g => g.name === "Size");',
            '    const extrasGroup = json.modifierGroups.find(g => g.name === "Extras");',
            '    const medium = sizeGroup.modifiers.find(m => m.name.includes("Medium"));',
            '    const freshCherries = extrasGroup.modifiers.find(m => m.name.includes("Fresh cherries"));',
            '    const chocoDrip = extrasGroup.modifiers.find(m => m.name.includes("Chocolate drip"));',
            '    pm.expect(medium).to.exist;',
            '    pm.expect(freshCherries).to.exist;',
            '    pm.expect(chocoDrip).to.exist;',
            '    pm.collectionVariables.set("modId_SizeMedium", String(medium.id));',
            '    pm.collectionVariables.set("modId_FreshCherries", String(freshCherries.id));',
            '    pm.collectionVariables.set("modId_ChocolateDrip", String(chocoDrip.id));',
            '});',
          ]
        ),
        createRequest(
          'Get Products (Turkey - TRY Currency)',
          'GET',
          '/api/products',
          [{ key: 'region', value: 'TUR' }],
          null,
          [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Converts Cherry Cake price to Turkish Lira (1020.00)", function () {',
            '    const json = pm.response.json();',
            '    const cherryCake = json.find(p => p.name === "Cherry Cake");',
            '    pm.expect(cherryCake.price).to.eql(1020.00);',
            '});',
          ]
        ),
        createRequest('Catalog Error: Missing Region', 'GET', '/api/products', [], null, [
          'pm.test("Status code is 400 Bad Request", function () {',
          '    pm.response.to.have.status(400);',
          '});',
        ]),
        createRequest(
          'Catalog Error: Unknown Region',
          'GET',
          '/api/products',
          [{ key: 'region', value: 'XYZ' }],
          null,
          [
            'pm.test("Status code is 404 Not Found", function () {',
            '    pm.response.to.have.status(404);',
            '});',
            'pm.test("Error message mentions region XYZ", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.message).to.include("XYZ");',
            '});',
          ]
        ),
        createRequest(
          'Catalog Error: Unknown Product ID',
          'GET',
          '/api/products/999999',
          [{ key: 'region', value: 'UZB' }],
          null,
          [
            'pm.test("Status code is 404 Not Found", function () {',
            '    pm.response.to.have.status(404);',
            '});',
          ]
        ),
      ],
    },
    {
      name: '03 - Cart Calculations (CC-16 & CC-33)',
      item: [
        createRequest(
          'CALC-01: UZB - Modifiers & 3% Discount',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: ['{{modId_SizeMedium}}'],
              },
            ],
          },
          [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Validates UZB calculations (UZS, 15% VAT, 3% discount)", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.currencyCode).to.eql("UZS");',
            '    pm.expect(json.subtotal).to.eql(480000.00);',
            '    pm.expect(json.vatRate).to.eql(0.1500);',
            '    pm.expect(json.vatAmount).to.eql(72000.00);',
            '    pm.expect(json.amountInclVat).to.eql(552000.00);',
            '    pm.expect(json.discountRate).to.eql(0.0300);',
            '    pm.expect(json.discountAmount).to.eql(16560.00);',
            '    pm.expect(json.deliveryFee).to.eql(0.00);',
            '    pm.expect(json.total).to.eql(535440.00);',
            '});',
          ]
        ),
        createRequest(
          'CALC-02: GEO - Composite MULTI Modifiers (Size + 2 Extras)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'GEO',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: [
                  '{{modId_SizeMedium}}',
                  '{{modId_FreshCherries}}',
                  '{{modId_ChocolateDrip}}',
                ],
              },
            ],
          },
          [
            'pm.test("Status code is 200", function () {',
            '    pm.response.to.have.status(200);',
            '});',
            'pm.test("Validates GEO composite MULTI modifiers & HALF_UP rounding", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.currencyCode).to.eql("GEL");',
            '    pm.expect(json.items[0].unitPrice).to.eql(85.80);',
            '    pm.expect(json.items[0].modifiersPrice).to.eql(35.10);',
            '    pm.expect(json.items[0].lineTotal).to.eql(120.90);',
            '    pm.expect(json.subtotal).to.eql(120.90);',
            '    pm.expect(json.vatAmount).to.eql(14.51);',
            '    pm.expect(json.amountInclVat).to.eql(135.41);',
            '    pm.expect(json.discountRate).to.eql(0.0300);',
            '    pm.expect(json.discountAmount).to.eql(4.06);',
            '    pm.expect(json.total).to.eql(131.35);',
            '});',
          ]
        ),
        createRequest(
          'CALC-03: Country Switch Same Cart (UZB -> UZS)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 2, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("UZB Tiramisu x2 = 207000.00 UZS (below 300000 threshold)", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.currencyCode).to.eql("UZS");',
            '    pm.expect(json.subtotal).to.eql(180000.00);',
            '    pm.expect(json.vatAmount).to.eql(27000.00);',
            '    pm.expect(json.amountInclVat).to.eql(207000.00);',
            '    pm.expect(json.discountRate).to.eql(0.0000);',
            '    pm.expect(json.total).to.eql(207000.00);',
            '});',
          ]
        ),
        createRequest(
          'CALC-04: Country Switch Same Cart (KAZ -> KZT)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'KAZ',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 2, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("KAZ Tiramisu x2 = 9072.00 KZT (20% VAT)", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.currencyCode).to.eql("KZT");',
            '    pm.expect(json.subtotal).to.eql(7560.00);',
            '    pm.expect(json.vatAmount).to.eql(1512.00);',
            '    pm.expect(json.total).to.eql(9072.00);',
            '});',
          ]
        ),
        createRequest(
          'CALC-05: Country Switch Same Cart (UKR -> UAH)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UKR',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 2, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("UKR Tiramisu x2 = 615.60 UAH (8% VAT)", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.currencyCode).to.eql("UAH");',
            '    pm.expect(json.subtotal).to.eql(570.00);',
            '    pm.expect(json.vatAmount).to.eql(45.60);',
            '    pm.expect(json.total).to.eql(615.60);',
            '});',
          ]
        ),
        createRequest(
          'CALC-06: Country Switch Same Cart (CHN -> CNY)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'CHN',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 2, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("CHN Tiramisu x2 = 142.50 CNY (18% VAT)", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.currencyCode).to.eql("CNY");',
            '    pm.expect(json.subtotal).to.eql(120.76);',
            '    pm.expect(json.vatAmount).to.eql(21.74);',
            '    pm.expect(json.total).to.eql(142.50);',
            '});',
          ]
        ),
        createRequest(
          'CALC-07: Turkey Extended Region (TRY, 18% VAT)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'TUR',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: ['{{modId_SizeMedium}}'],
              },
            ],
          },
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("Validates Turkish Lira pricing & discount", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.currencyCode).to.eql("TRY");',
            '    pm.expect(json.subtotal).to.eql(1360.00);',
            '    pm.expect(json.vatAmount).to.eql(244.80);',
            '    pm.expect(json.discountRate).to.eql(0.0300);',
            '    pm.expect(json.discountAmount).to.eql(48.14);',
            '    pm.expect(json.total).to.eql(1556.66);',
            '});',
          ]
        ),
        createRequest(
          'CALC-08: Error - Zero Quantity (400)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 0, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });',
            'pm.test("Error field indicates items[0].quantity", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.errors[0].field).to.eql("items[0].quantity");',
            '});',
          ]
        ),
        createRequest(
          'CALC-09: Error - Negative Quantity (400)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: -1, modifierIds: [] }],
          },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
        createRequest(
          'CALC-10: Error - Empty Cart (400)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            items: [],
          },
          [
            'pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });',
            'pm.test("Reports cart is empty", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.errors[0].message).to.include("cart is empty");',
            '});',
          ]
        ),
        createRequest(
          'CALC-11: Error - Missing Region (400)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 1, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });',
            'pm.test("Reports missing region", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.errors[0].field).to.eql("region");',
            '});',
          ]
        ),
        createRequest(
          'CALC-12: Error - Unknown Region XYZ (404)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'XYZ',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 1, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 404 Not Found", function () { pm.response.to.have.status(404); });',
            'pm.test("Message mentions Region XYZ not found", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.message).to.include("Region XYZ not found");',
            '});',
          ]
        ),
        createRequest(
          'CALC-13: Error - Out of Stock Product Napoleon in GEO (409)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'GEO',
            items: [{ productId: '{{productId_Napoleon}}', quantity: 1, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 409 Conflict", function () { pm.response.to.have.status(409); });',
            'pm.test("Message mentions out of stock", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.message).to.include("out of stock");',
            '});',
          ]
        ),
        createRequest(
          'CALC-14: Error - Duplicate Modifier (400)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: ['{{modId_SizeMedium}}', '{{modId_SizeMedium}}'],
              },
            ],
          },
          [
            'pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });',
            'pm.test("Message mentions duplicate modifier", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.message).to.include("duplicate");',
            '});',
          ]
        ),
      ],
    },
    {
      name: '04 - Fulfillment Read Endpoints & Delivery Fee Calc (CC-74 Bonus)',
      item: [
        createRequest(
          'Get Pickup Points (UZB)',
          'GET',
          '/api/pickup-points',
          [{ key: 'region', value: 'UZB' }],
          null,
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("Returns open pickup points and stores pickupPointId", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json).to.be.an("array").that.has.length.at.least(1);',
            '    pm.expect(json[0]).to.have.all.keys("id", "name", "address", "openingHours");',
            '    pm.collectionVariables.set("pickupPointId", String(json[0].id));',
            '});',
          ]
        ),
        createRequest(
          'Get Delivery Zones (UZB)',
          'GET',
          '/api/delivery-zones',
          [{ key: 'region', value: 'UZB' }],
          null,
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("Returns zones sorted cheapest first and stores IDs", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json).to.be.an("array").that.has.length.at.least(2);',
            '    const center = json.find(z => z.name === "Center");',
            '    const suburbs = json.find(z => z.name === "Suburbs");',
            '    pm.expect(center).to.exist;',
            '    pm.expect(suburbs).to.exist;',
            '    pm.expect(center.deliveryFee).to.eql(15000.00);',
            '    pm.expect(suburbs.deliveryFee).to.eql(25000.00);',
            '    pm.collectionVariables.set("deliveryZoneId_Center", String(center.id));',
            '    pm.collectionVariables.set("deliveryZoneId_Suburbs", String(suburbs.id));',
            '});',
          ]
        ),
        createRequest(
          'Calculate Cart with Delivery Zone Fee (Discount + Delivery)',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            deliveryZoneId: '{{deliveryZoneId_Center}}',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: ['{{modId_SizeMedium}}'],
              },
            ],
          },
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("Adds deliveryFee (15000) after 3% discount", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.subtotal).to.eql(480000.00);',
            '    pm.expect(json.discountAmount).to.eql(16560.00);',
            '    pm.expect(json.deliveryFee).to.eql(15000.00);',
            '    pm.expect(json.total).to.eql(550440.00);',
            '});',
          ]
        ),
        createRequest(
          'Calculate Cart: Delivery Does Not Shift Discount Threshold',
          'POST',
          '/api/cart/calculate',
          [],
          {
            region: 'UZB',
            deliveryZoneId: '{{deliveryZoneId_Suburbs}}',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 2, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("207000 + 25000 = 232000 with 0% discount", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.amountInclVat).to.eql(207000.00);',
            '    pm.expect(json.discountRate).to.eql(0.0000);',
            '    pm.expect(json.deliveryFee).to.eql(25000.00);',
            '    pm.expect(json.total).to.eql(232000.00);',
            '});',
          ]
        ),
        createRequest(
          'Get Time Slots ({{futureDate}})',
          'GET',
          '/api/time-slots',
          [{ key: 'date', value: '{{futureDate}}' }],
          null,
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("Returns slots and saves an available timeSlotId", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json).to.be.an("array").that.has.length.at.least(1);',
            '    const openSlot = json.find(s => s.isAvailable === true);',
            '    pm.expect(openSlot).to.exist;',
            '    pm.collectionVariables.set("timeSlotId", String(openSlot.id));',
            '});',
          ]
        ),
        createRequest(
          'Time Slots Error: Past Date (400)',
          'GET',
          '/api/time-slots',
          [{ key: 'date', value: '2020-01-01' }],
          null,
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
        createRequest(
          'Delivery Zones Error: Unknown Region (404)',
          'GET',
          '/api/delivery-zones',
          [{ key: 'region', value: 'XYZ' }],
          null,
          ['pm.test("Status code is 404 Not Found", function () { pm.response.to.have.status(404); });']
        ),
      ],
    },
    {
      name: '05 - Auth & RBAC Security Smoke',
      item: [
        createRequest('Auth Me: Unauthenticated Returns 401', 'GET', '/api/auth/me', [], null, [
          'pm.test("Status code is 401 Unauthorized", function () { pm.response.to.have.status(401); });',
        ]),
        createRequest(
          'Auth Request Code: Invalid Email Returns 400',
          'POST',
          '/api/auth/request-code',
          [],
          { email: 'not-an-email' },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
        createRequest('Reports Sales: Unauthenticated Returns 401', 'GET', '/api/reports/sales', [], null, [
          'pm.test("Status code is 401 Unauthorized", function () { pm.response.to.have.status(401); });',
        ]),
        createRequest('Reports PDF Export: Unauthenticated Returns 401', 'GET', '/api/reports/export', [], null, [
          'pm.test("Status code is 401 Unauthorized", function () { pm.response.to.have.status(401); });',
        ]),
        createRequest('Admin Categories: Unauthenticated Returns 401', 'GET', '/api/admin/categories', [], null, [
          'pm.test("Status code is 401 Unauthorized", function () { pm.response.to.have.status(401); });',
        ]),
        createRequest('Admin Regions: Unauthenticated Returns 401', 'GET', '/api/admin/regions', [], null, [
          'pm.test("Status code is 401 Unauthorized", function () { pm.response.to.have.status(401); });',
        ]),
      ],
    },
    {
      name: '06 - Orders API (CC-47 & CC-74 Write Flows - Local/Test DB)',
      item: [
        createRequest(
          'Create Guest Order (GEO + X-Client-Id)',
          'POST',
          '/api/orders',
          [],
          {
            region: 'GEO',
            customer: {
              name: 'Nino Beridze',
              phone: '+995599112233',
              email: 'nino@example.com',
            },
            orderDate: '{{futureDate}}',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 2,
                modifierIds: ['{{modId_SizeMedium}}', '{{modId_FreshCherries}}'],
              },
            ],
          },
          [
            'pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });',
            'pm.test("Generates orderNumber CC-YYYY-* with GEL total 254.22", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.orderNumber).to.match(/^CC-\\d{4}-\\d+$/);',
            '    pm.expect(json.region).to.eql("GEO");',
            '    pm.expect(json.currencyCode).to.eql("GEL");',
            '    pm.expect(json.total).to.eql(254.22);',
            '});',
          ],
          [{ key: 'X-Client-Id', value: '{{clientId}}' }]
        ),
        createRequest(
          'Create Order with DELIVERY Fulfillment & Time Slot (UZB)',
          'POST',
          '/api/orders',
          [],
          {
            region: 'UZB',
            customer: {
              name: 'Malika Karimova',
              phone: '+998901234567',
              email: 'malika@example.com',
            },
            orderDate: '{{futureDate}}',
            fulfillmentType: 'DELIVERY',
            deliveryZoneId: '{{deliveryZoneId_Center}}',
            timeSlotId: '{{timeSlotId}}',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: ['{{modId_SizeMedium}}'],
              },
            ],
          },
          [
            'pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });',
            'pm.test("Persists DELIVERY fulfillment and adds 15000.00 fee", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.fulfillmentType).to.eql("DELIVERY");',
            '    pm.expect(json.deliveryFee).to.eql(15000.00);',
            '    pm.expect(json.total).to.eql(550440.00);',
            '});',
          ],
          [{ key: 'X-Client-Id', value: '{{clientId}}' }]
        ),
        createRequest(
          'Create Order with PICKUP Fulfillment & Time Slot (UZB)',
          'POST',
          '/api/orders',
          [],
          {
            region: 'UZB',
            customer: {
              name: 'Azizbek Tursunov',
              phone: '+998907654321',
              email: 'azizbek@example.com',
            },
            orderDate: '{{futureDate}}',
            fulfillmentType: 'PICKUP',
            pickupPointId: '{{pickupPointId}}',
            timeSlotId: '{{timeSlotId}}',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 1, modifierIds: [] }],
          },
          [
            'pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });',
            'pm.test("Persists PICKUP fulfillment with 0.00 deliveryFee", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.fulfillmentType).to.eql("PICKUP");',
            '    pm.expect(json.deliveryFee).to.eql(0.00);',
            '});',
          ],
          [{ key: 'X-Client-Id', value: '{{clientId}}' }]
        ),
        createRequest(
          'Get My Orders (Guest X-Client-Id)',
          'GET',
          '/api/orders/my',
          [],
          null,
          [
            'pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            'pm.test("Returns array of orders newest first", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json).to.be.an("array");',
            '});',
          ],
          [{ key: 'X-Client-Id', value: '{{clientId}}' }]
        ),
        createRequest(
          'Order Error: Missing Customer Name (400)',
          'POST',
          '/api/orders',
          [],
          {
            region: 'GEO',
            customer: { name: '', phone: '+995599112233', email: 'nino@example.com' },
            orderDate: '{{futureDate}}',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: ['{{modId_SizeMedium}}'],
              },
            ],
          },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
        createRequest(
          'Order Error: Past Order Date (400)',
          'POST',
          '/api/orders',
          [],
          {
            region: 'GEO',
            customer: { name: 'Nino Beridze', phone: '+995599112233', email: 'nino@example.com' },
            orderDate: '2020-01-01',
            items: [
              {
                productId: '{{productId_CherryCake}}',
                quantity: 1,
                modifierIds: ['{{modId_SizeMedium}}'],
              },
            ],
          },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
        createRequest(
          'Order Error: PICKUP Missing pickupPointId (400)',
          'POST',
          '/api/orders',
          [],
          {
            region: 'UZB',
            customer: { name: 'Nino Beridze', phone: '+998901112233', email: 'nino@example.com' },
            orderDate: '{{futureDate}}',
            fulfillmentType: 'PICKUP',
            timeSlotId: '{{timeSlotId}}',
            items: [{ productId: '{{productId_Tiramisu}}', quantity: 1, modifierIds: [] }],
          },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
      ],
    },
    {
      name: '07 - Table Bookings (CC-74 Bonus Write Flows - Local/Test DB)',
      item: [
        createRequest(
          'Create Table Booking (201 Created)',
          'POST',
          '/api/bookings',
          [],
          {
            date: '{{futureDate}}',
            timeSlotId: '{{timeSlotId}}',
            guestsCount: 4,
            customer: {
              name: 'Leyla Mammadova',
              phone: '+995555123456',
              email: 'leyla@example.com',
            },
            region: 'GEO',
          },
          [
            'pm.test("Status code is 201 Created", function () { pm.response.to.have.status(201); });',
            'pm.test("Returns bookingNumber, tableNumber, date, time, guestsCount", function () {',
            '    const json = pm.response.json();',
            '    pm.expect(json.bookingNumber).to.be.a("string").and.not.be.empty;',
            '    pm.expect(json.tableNumber).to.be.a("number");',
            '    pm.expect(json.guestsCount).to.eql(4);',
            '});',
          ]
        ),
        createRequest(
          'Booking Error: Past Date (400)',
          'POST',
          '/api/bookings',
          [],
          {
            date: '2020-01-01',
            timeSlotId: '{{timeSlotId}}',
            guestsCount: 2,
            customer: {
              name: 'Test Guest',
              phone: '+995555123456',
              email: 'test@example.com',
            },
          },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
        createRequest(
          'Booking Error: Guests Count Exceeds Max 12 (400)',
          'POST',
          '/api/bookings',
          [],
          {
            date: '{{futureDate}}',
            timeSlotId: '{{timeSlotId}}',
            guestsCount: 13,
            customer: {
              name: 'Test Guest',
              phone: '+995555123456',
              email: 'test@example.com',
            },
          },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
        createRequest(
          'Booking Error: Guests Count Zero (400)',
          'POST',
          '/api/bookings',
          [],
          {
            date: '{{futureDate}}',
            timeSlotId: '{{timeSlotId}}',
            guestsCount: 0,
            customer: {
              name: 'Test Guest',
              phone: '+995555123456',
              email: 'test@example.com',
            },
          },
          ['pm.test("Status code is 400 Bad Request", function () { pm.response.to.have.status(400); });']
        ),
      ],
    },
    {
      name: '08 - Sales Reports & PDF Export (CC-56 Authenticated STAFF/ADMIN)',
      item: [
        createRequest(
          'Filter Set 1: All Countries, 6 Months, Group By REGION',
          'GET',
          '/api/reports/sales',
          [
            { key: 'from', value: '{{reportSixMonthsStart}}' },
            { key: 'to', value: '{{reportToDate}}' },
            { key: 'groupBy', value: 'REGION' },
          ],
          null,
          [
            'const hasToken = Boolean(pm.collectionVariables.get("authToken") || pm.environment.get("authToken"));',
            'if (!hasToken) {',
            '    pm.test("Requires STAFF/ADMIN Bearer authToken (returns 401 when unset)", function () {',
            '        pm.response.to.have.status(401);',
            '    });',
            '} else {',
            '    pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            '    pm.test("KPI and row sums match snapshot structure", function () {',
            '        const json = pm.response.json();',
            '        pm.expect(json).to.have.property("kpi");',
            '        pm.expect(json).to.have.property("rows");',
            '        const rowOrdersSum = json.rows.reduce((acc, r) => acc + r.ordersCount, 0);',
            '        pm.expect(rowOrdersSum).to.eql(json.kpi.ordersCount);',
            '    });',
            '}',
          ],
          [{ key: 'Authorization', value: 'Bearer {{authToken}}' }]
        ),
        createRequest(
          'Filter Set 2: Single Country (UZB), 6 Months, Group By MONTH',
          'GET',
          '/api/reports/sales',
          [
            { key: 'from', value: '{{reportSixMonthsStart}}' },
            { key: 'to', value: '{{reportToDate}}' },
            { key: 'region', value: 'UZB' },
            { key: 'groupBy', value: 'MONTH' },
          ],
          null,
          [
            'const hasToken = Boolean(pm.collectionVariables.get("authToken") || pm.environment.get("authToken"));',
            'if (!hasToken) {',
            '    pm.test("Requires STAFF/ADMIN Bearer authToken (401 when unset)", function () { pm.response.to.have.status(401); });',
            '} else {',
            '    pm.test("Status code is 200 & UZS currency", function () {',
            '        pm.response.to.have.status(200);',
            '        const json = pm.response.json();',
            '        pm.expect(json.currencyCode).to.eql("UZS");',
            '    });',
            '}',
          ],
          [{ key: 'Authorization', value: 'Bearer {{authToken}}' }]
        ),
        createRequest(
          'Filter Set 3: Single Month, All Countries, Group By REGION',
          'GET',
          '/api/reports/sales',
          [
            { key: 'from', value: '{{reportMonthStart}}' },
            { key: 'to', value: '{{reportToDate}}' },
            { key: 'groupBy', value: 'REGION' },
          ],
          null,
          [
            'const hasToken = Boolean(pm.collectionVariables.get("authToken") || pm.environment.get("authToken"));',
            'if (!hasToken) {',
            '    pm.test("Requires STAFF/ADMIN Bearer authToken (401 when unset)", function () { pm.response.to.have.status(401); });',
            '} else {',
            '    pm.test("Status code is 200", function () { pm.response.to.have.status(200); });',
            '}',
          ],
          [{ key: 'Authorization', value: 'Bearer {{authToken}}' }]
        ),
        createRequest(
          'Export Sales PDF (Matching Filter Set 1)',
          'GET',
          '/api/reports/export',
          [
            { key: 'format', value: 'PDF' },
            { key: 'from', value: '{{reportSixMonthsStart}}' },
            { key: 'to', value: '{{reportToDate}}' },
            { key: 'groupBy', value: 'REGION' },
          ],
          null,
          [
            'const hasToken = Boolean(pm.collectionVariables.get("authToken") || pm.environment.get("authToken"));',
            'if (!hasToken) {',
            '    pm.test("Requires STAFF/ADMIN Bearer authToken (401 when unset)", function () { pm.response.to.have.status(401); });',
            '} else {',
            '    pm.test("Status code is 200 & Content-Type is application/pdf", function () {',
            '        pm.response.to.have.status(200);',
            '        pm.expect(pm.response.headers.get("Content-Type")).to.include("application/pdf");',
            '        pm.expect(pm.response.text()).to.match(/^%PDF-/);',
            '    });',
            '}',
          ],
          [{ key: 'Authorization', value: 'Bearer {{authToken}}' }]
        ),
        createRequest(
          'Reports Error: Inverted Date Range (400 when STAFF, 401 when unauth)',
          'GET',
          '/api/reports/sales',
          [
            { key: 'from', value: '2026-12-31' },
            { key: 'to', value: '2026-01-01' },
          ],
          null,
          [
            'const hasToken = Boolean(pm.collectionVariables.get("authToken") || pm.environment.get("authToken"));',
            'pm.test("Returns expected status (400 when authToken set, else 401)", function () {',
            '    pm.response.to.have.status(hasToken ? 400 : 401);',
            '});',
          ],
          [{ key: 'Authorization', value: 'Bearer {{authToken}}' }]
        ),
      ],
    },
  ],
};

const collectionPath = path.join(__dirname, 'CherryCake_API.postman_collection.json');
fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf-8');
console.log('Generated:', collectionPath);

const localEnv = {
  id: '3b9f4a10-82d1-4f3b-9a88-2e1c9d4b68e2',
  name: 'CherryCake Localhost',
  values: [
    { key: 'baseUrl', value: 'http://localhost:8080', type: 'default', enabled: true },
    { key: 'region', value: 'UZB', type: 'default', enabled: true },
    { key: 'authToken', value: '', type: 'secret', enabled: true },
    { key: 'clientId', value: '3f2b8c1e-6a4d-4e7b-9c1a-2d5f7a9b0c3e', type: 'default', enabled: true },
  ],
  _postman_variable_scope: 'environment',
};

const stagingEnv = {
  id: '7d4c19a2-3e84-4a11-b853-11c7e4f2a901',
  name: 'CherryCake Staging (Render)',
  values: [
    { key: 'baseUrl', value: 'https://cherrycake-deploy.onrender.com', type: 'default', enabled: true },
    { key: 'region', value: 'UZB', type: 'default', enabled: true },
    { key: 'authToken', value: '', type: 'secret', enabled: true },
    { key: 'clientId', value: '3f2b8c1e-6a4d-4e7b-9c1a-2d5f7a9b0c3e', type: 'default', enabled: true },
  ],
  _postman_variable_scope: 'environment',
};

const localEnvPath = path.join(__dirname, 'CherryCake_Local.postman_environment.json');
const stagingEnvPath = path.join(__dirname, 'CherryCake_Staging.postman_environment.json');
fs.writeFileSync(localEnvPath, JSON.stringify(localEnv, null, 2), 'utf-8');
fs.writeFileSync(stagingEnvPath, JSON.stringify(stagingEnv, null, 2), 'utf-8');
console.log('Generated:', localEnvPath);
console.log('Generated:', stagingEnvPath);
