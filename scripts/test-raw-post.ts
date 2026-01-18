const apiKey = "pk_live_dnX7sfOjZoIhBrisMOQ5J9NFS6Ee1V2W";
const baseUrl = "https://api.swatbloc.com";

async function testCreate() {
  const url = `${baseUrl}/api/sdk/products`;
  console.log(`Testing POST to ${url} with Public Key...`);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-SwatBloc-Key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Test Product",
      name: "Test Product",
      price: 1000,
      description: "Test description",
      category: "service",
      slug: "test-product-" + Date.now(),
      inventory_quantity: 10,
      images: [],
      barcode: ""
    })
  });

  console.log("Status:", response.status);
  const data = await response.json().catch(() => ({}));
  console.log("Response:", JSON.stringify(data, null, 2));
}

testCreate();
