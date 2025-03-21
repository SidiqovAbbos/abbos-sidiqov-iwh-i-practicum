const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_KEY;
const contactProperties = ["name", "description", "price", "hs_object_id"]
  .map((property) => `properties=${property}`)
  .join("&");

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get("/", async (req, res) => {
  const contactsUrl = `https://api.hubspot.com/crm/v3/objects/cars?${contactProperties}`;
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  try {
    const resp = await axios.get(contactsUrl, { headers });
    const data = resp.data.results;
    const cars = data.map((contact) => ({
      id: contact.properties.hs_object_id,
      name: contact.properties.name,
      description: contact.properties.description,
      price: contact.properties.price,
    }));
    res.render("homepage", {
      title: "Contact list | HubSpot APIs",
      cars,
    });
  } catch (error) {
    console.error(error);
  }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get("/update-cobj", async (req, res) => {
  const contactId = req.query.id;

  if (!contactId) {
    res.render("updates", {
      title: "Contact Details | HubSpot APIs",
      car: {
        id: "",
        name: "",
        description: "",
        price: 0,
      },
    });
    return;
  }

  try {
    const contactUrl = `https://api.hubspot.com/crm/v3/objects/cars/${contactId}?${contactProperties}`;
    const headers = {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
      "Content-Type": "application/json",
    };

    const result = await axios.get(contactUrl, { headers });
    const car = {
      id: result.data.properties.hs_object_id,
      name: result.data.properties.name,
      description: result.data.properties.description || "",
      price: result.data.properties.price || "",
    };

    res.render("updates", {
      title: "Contact Details | HubSpot APIs",
      car,
    });
  } catch (error) {
    console.error(error);
  }
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post("/update-cobj", async (req, res) => {
  const contactId = req.body.id;
  const contactData = {
    properties: {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price) || 0,
    },
  };

  const requestUrl = !contactId
    ? `https://api.hubspot.com/crm/v3/objects/cars`
    : `https://api.hubspot.com/crm/v3/objects/cars/${contactId}`;

  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  try {
    if (contactId) {
      await axios.patch(requestUrl, contactData, { headers });
    } else {
      await axios.post(requestUrl, contactData, { headers });
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating contact");
  }
});

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/

// * Localhost
app.listen(3000, () => console.log("Listening on http://localhost:3000"));
