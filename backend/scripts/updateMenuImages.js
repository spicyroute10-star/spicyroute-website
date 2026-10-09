import { supabase } from '../src/config/supabase.js';

const IMAGE_MAP = [
  // Biryanis
  { match: /mutton.*biryani/i, url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80' },
  { match: /prawns.*biryani/i, url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80' },
  { match: /fish.*biryani/i, url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80' },
  { match: /egg.*biryani/i, url: 'https://images.unsplash.com/photo-1599043513903-ecac4802126b?w=800&auto=format&fit=crop&q=80' },
  { match: /paneer.*biryani/i, url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80' },
  { match: /panner.*biryani/i, url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80' },
  { match: /mushroom.*biryani/i, url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80' },
  { match: /veg.*biryani/i, url: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80' },
  { match: /dum.*biryani/i, url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { match: /lolipop.*biryani|lollipop.*biryani/i, url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
  { match: /fry.*biryani|65.*biryani|boneless.*biryani|mughlai.*biryani|mogalai.*biryani|special.*biryani|family.*pack|mixed.*biryani|rambo.*biryani/i, url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&auto=format&fit=crop&q=80' },
  { match: /biryani|briyani/i, url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80' },
  { match: /curd.*rice/i, url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80' },

  // Fried Rice
  { match: /chicken.*fried.*rice|chicken.*schezwan.*rice|sp.*chicken.*fried.*rice/i, url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80' },
  { match: /egg.*fried.*rice|egg.*schezwan.*rice|double.*egg.*rice/i, url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80' },
  { match: /manchurian.*rice/i, url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80' },
  { match: /paneer.*fried.*rice|panner.*fried.*rice/i, url: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&auto=format&fit=crop&q=80' },
  { match: /mushroom.*fried.*rice/i, url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80' },
  { match: /kaju.*rice/i, url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80' },
  { match: /fried.*rice/i, url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80' },

  // Noodles
  { match: /chicken.*noodles|chicken.*schezwan.*noodles|sp.*chicken.*noodles/i, url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80' },
  { match: /egg.*noodles|egg.*schezwan.*noodles|double.*egg.*noodles/i, url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&auto=format&fit=crop&q=80' },
  { match: /manchurian.*noodles/i, url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80' },
  { match: /paneer.*noodles|panner.*noodles/i, url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop&q=80' },
  { match: /mushroom.*noodles/i, url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80' },
  { match: /kaju.*noodles/i, url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80' },
  { match: /noodles/i, url: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&auto=format&fit=crop&q=80' },

  // Starters - Chicken
  { match: /chicken.*lolipop|chicken.*lollipop|kfc.*lolipop/i, url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
  { match: /chicken.*65|chicken.*555|dragon.*chicken|chicken.*fry/i, url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80' },
  { match: /chilli.*chicken/i, url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=80' },
  { match: /chicken.*manchurian|chicken.*manchuria/i, url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=80' },
  { match: /pepper.*chicken|lemon.*chicken|chicken.*majestic|chicken.*roast/i, url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80' },

  // Starters - Seafood
  { match: /fish.*fry|fish.*roast|apollo.*fish|chilli.*fish|fish.*65/i, url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80' },
  { match: /loose.*prawns|prawns.*fry|prawns.*65|chilli.*prawns|prawns.*roast/i, url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80' },

  // Starters - Veg & Paneer & Mushroom
  { match: /paneer.*manchur|panner.*manchur|paneer.*65|paneer.*chilli|paneer.*majestic/i, url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80' },
  { match: /mushroom.*manchur|mushroom.*65|mushroom.*chilli/i, url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80' },
  { match: /baby.*corn/i, url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80' },
  { match: /veg.*manchur|crispy.*veg/i, url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80' },
  { match: /momos/i, url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=800&auto=format&fit=crop&q=80' },

  // Eggs
  { match: /egg.*bhurji|omelette|egg.*half.*boiled/i, url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80' },
  { match: /egg.*manchur|egg.*chilli/i, url: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800&auto=format&fit=crop&q=80' },

  // Tiffins
  { match: /idly|idli/i, url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80' },
  { match: /vada/i, url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
  { match: /dosa/i, url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80' },
  { match: /puri|poori/i, url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80' },
  { match: /punugulu|bajji/i, url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80' },

  // Curries - Non Veg
  { match: /butter.*chicken|chicken.*masala|mughlai.*chicken|chicken.*maharani|chicken.*do-pyaza|chicken.*chettinad|chicken.*curry/i, url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80' },
  { match: /prawns.*curry/i, url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80' },
  { match: /fish.*curry/i, url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80' },
  { match: /egg.*curry/i, url: 'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=800&auto=format&fit=crop&q=80' },

  // Curries - Veg
  { match: /paneer.*butter|paneer.*tikka|palak.*paneer|kadai.*paneer|methi.*chaman|kaju.*paneer/i, url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80' },
  { match: /mushroom.*masala/i, url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
  { match: /mix.*veg|chana.*masala|veg.*kolhapuri|kadai.*veg|veg.*jaipuri|curry/i, url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },

  // Breads & Rolls & Meals
  { match: /parota|parotta/i, url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80' },
  { match: /chapati|roti|naan/i, url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&auto=format&fit=crop&q=80' },
  { match: /shawarma/i, url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800&auto=format&fit=crop&q=80' },
  { match: /meals/i, url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80' }
];

function getImageUrlForDish(name) {
  const clean = name.trim().toLowerCase();
  for (const item of IMAGE_MAP) {
    if (item.match.test(clean)) {
      return item.url;
    }
  }
  // Fallback high quality food image
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
}

async function updateAllMenuImages() {
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, name, image_url')
    .order('id', { ascending: true });

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  console.log(`Starting image updates for ${items.length} items...`);
  let updatedCount = 0;

  for (const item of items) {
    const targetUrl = getImageUrlForDish(item.name);
    // Update if it has the old generic placeholder or encrypted thumbnail or different image
    const { error: updateErr } = await supabase
      .from('menu_items')
      .update({ image_url: targetUrl })
      .eq('id', item.id);

    if (updateErr) {
      console.error(`Failed to update item ${item.id} (${item.name}):`, updateErr);
    } else {
      updatedCount++;
    }
  }

  console.log(`Successfully updated images for ${updatedCount} items!`);
}

updateAllMenuImages();
