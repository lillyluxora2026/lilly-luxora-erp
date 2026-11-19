const { createClient } = require('@supabase/supabase-js');

const url = 'https://yrdywjnajegooakpoegp.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZHl3am5hamVnb29ha3BvZWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzk3NjI2OSwiZXhwIjoyMTA5NTUyMjY5fQ.DRZLR2QxOFKkqVbcmWY4aSEcz80zOb6jVoMeJBN4_NY';

const supabase = createClient(url, serviceKey);

const WAREHOUSE_ID = '6859585c-2cb8-4745-8a5b-93b8a0752803';

const CLOUDINARY_IMAGES = {
    hero_flatlay: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113218.jpg.jpg',
    charms_pendants: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113317.jpg.jpg',
    cascade_layers: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113334.jpg.jpg',
    cuff_shell: 'https://res.cloudinary.com/zivp4yyq/image/upload/f_auto/q_auto/IMG_20261118_113451.jpg.jpg'
};

async function seed() {
    console.log('--- 1. Seeding Categories & Subcategories ---');
    // Main Categories
    const mainCats = [
        {
            name: 'Necklaces',
            slug: 'necklaces',
            description: 'Timeless pendants, everyday chains, and statement medallions crafted in 18K PVD gold plating.',
            image_url: CLOUDINARY_IMAGES.charms_pendants,
            banner_kicker: 'Demi-Fine Collection',
            banner_title: 'Necklaces & Pendants',
            banner_description: 'Designed to layer or shine solo with waterproof, anti-tarnish durability.',
            banner_image_url: CLOUDINARY_IMAGES.cascade_layers,
            sort_order: 1
        },
        {
            name: 'Bracelets',
            slug: 'bracelets',
            description: 'Sculpted cuffs, paperclip links, and pearl bracelets designed for effortless stacking.',
            image_url: CLOUDINARY_IMAGES.cuff_shell,
            banner_kicker: 'Wristwear Edit',
            banner_title: 'Bracelets & Cuffs',
            banner_description: 'Ergonomic, hypoallergenic, and finished with brilliant gemstones.',
            banner_image_url: CLOUDINARY_IMAGES.cuff_shell,
            sort_order: 2
        },
        {
            name: 'Earrings',
            slug: 'earrings',
            description: 'Effortless everyday huggies, statement hoops, and delicate charm drops.',
            image_url: CLOUDINARY_IMAGES.hero_flatlay,
            banner_kicker: 'The Ear Edit',
            banner_title: 'Earrings & Hoops',
            banner_description: 'Featherlight, waterproof comfort for 24/7 wear.',
            banner_image_url: CLOUDINARY_IMAGES.hero_flatlay,
            sort_order: 3
        }
    ];

    const { data: createdMainCats, error: mainCatErr } = await supabase
        .from('categories')
        .upsert(mainCats, { onConflict: 'slug' })
        .select();

    if (mainCatErr) throw mainCatErr;
    console.log(`Created ${createdMainCats.length} main categories.`);

    const catMap = Object.fromEntries(createdMainCats.map(c => [c.slug, c.id]));

    // Subcategories
    const subCats = [
        {
            name: 'Pendants & Medallions',
            slug: 'pendants-medallions',
            parent_id: catMap['necklaces'],
            description: 'Sunbursts, coin medallions, and heirloom charms.',
            image_url: CLOUDINARY_IMAGES.charms_pendants,
            sort_order: 10
        },
        {
            name: 'Chains & Layering',
            slug: 'chains-layering',
            parent_id: catMap['necklaces'],
            description: 'Box chains, paperclip links, and layered sets.',
            image_url: CLOUDINARY_IMAGES.cascade_layers,
            sort_order: 11
        },
        {
            name: 'Sculpted Cuffs',
            slug: 'sculpted-cuffs',
            parent_id: catMap['bracelets'],
            description: 'Double-band architectural cuffs with bezel gemstones.',
            image_url: CLOUDINARY_IMAGES.cuff_shell,
            sort_order: 20
        },
        {
            name: 'Chain & Pearl Bracelets',
            slug: 'chain-pearl-bracelets',
            parent_id: catMap['bracelets'],
            description: 'Freshwater baroque pearls paired with golden links.',
            image_url: CLOUDINARY_IMAGES.hero_flatlay,
            sort_order: 21
        }
    ];

    const { data: createdSubCats, error: subCatErr } = await supabase
        .from('categories')
        .upsert(subCats, { onConflict: 'slug' })
        .select();

    if (subCatErr) throw subCatErr;
    console.log(`Created ${createdSubCats.length} subcategories.`);

    const subCatMap = Object.fromEntries(createdSubCats.map(c => [c.slug, c.id]));

    console.log('--- 2. Seeding 10 Products ---');
    const productsData = [
        {
            title: 'Solstice Sunburst Pearl Medallion Necklace',
            slug: 'solstice-sunburst-pearl-medallion-necklace',
            description: 'An ethereal medallion featuring an intricate spiraling sunburst motif accented with a luminous natural baroque freshwater pearl drop. Suspended from an 18K PVD gold-plated rope chain.',
            product_type: 'Necklace',
            category_id: subCatMap['pendants-medallions'] || catMap['necklaces'],
            tags: ['necklace', 'pendant', 'pearl', 'sunburst', 'waterproof', 'bestseller'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plating over Premium Stainless Steel, Natural Freshwater Pearl',
            care_instructions: 'Waterproof & anti-tarnish. Rinse with fresh water after swimming and pat dry.',
            features: ['18K PVD Gold Plated', 'Genuine Freshwater Pearl Drop', 'Waterproof & Sweatproof', 'Hypoallergenic & Nickel-Free'],
            is_featured: true,
            rating: 4.9,
            review_count: 28,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 1899,
            compare_at_price: 2499,
            cost_price: 650,
            inventory: 45,
            images: [CLOUDINARY_IMAGES.charms_pendants, CLOUDINARY_IMAGES.cascade_layers]
        },
        {
            title: 'Pavé Crystal Cherry Charm Pendant Necklace',
            slug: 'pave-crystal-cherry-charm-pendant-necklace',
            description: 'Playful yet luxurious, this golden cherry pendant is encrusted with micro-pavé blush pink cubic zirconia stones with sculpted golden leaves on a delicate box chain.',
            product_type: 'Necklace',
            category_id: subCatMap['pendants-medallions'] || catMap['necklaces'],
            tags: ['necklace', 'charm', 'cherry', 'pink crystal', 'waterproof'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plating, Micro-Pavé Cubic Zirconia',
            care_instructions: 'Clean with a soft cloth to maintain brilliant crystal sparkle.',
            features: ['Blush Pink Pavé Stones', 'Sculpted 3D Leaf Detail', 'Lobster Clasp with 2-inch Extender'],
            is_featured: true,
            rating: 4.8,
            review_count: 19,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 1699,
            compare_at_price: 2199,
            cost_price: 580,
            inventory: 35,
            images: [CLOUDINARY_IMAGES.charms_pendants, CLOUDINARY_IMAGES.hero_flatlay]
        },
        {
            title: 'Amour Beaded Heart & Lavender Crystal Pendant',
            slug: 'amour-beaded-heart-lavender-crystal-pendant',
            description: 'A romantic textured bead-work heart frame enclosing a faceted lavender quartz gemstone drop. Finished on a substantial textured wheat chain for a regal finish.',
            product_type: 'Necklace',
            category_id: subCatMap['pendants-medallions'] || catMap['necklaces'],
            tags: ['necklace', 'heart', 'crystal', 'lavender', 'romantic'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plating, Faceted Precision-Cut Crystal',
            care_instructions: 'Resistant to tarnishing, perfumes, and daily water exposure.',
            features: ['Intricate Beaded Texture', 'Faceted Crystal Heart', 'Heavy-Duty 18K Gold Plated Chain'],
            is_featured: true,
            rating: 5.0,
            review_count: 14,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 1999,
            compare_at_price: 2699,
            cost_price: 720,
            inventory: 30,
            images: [CLOUDINARY_IMAGES.charms_pendants, CLOUDINARY_IMAGES.cascade_layers]
        },
        {
            title: 'Lucky Pavé Diamond Horseshoe Link Necklace',
            slug: 'lucky-pave-diamond-horseshoe-link-necklace',
            description: 'Channel good fortune with this sleek, polished horseshoe pendant studded with flush-set brilliant cubic zirconia stones on a round-link curb chain.',
            product_type: 'Necklace',
            category_id: subCatMap['chains-layering'] || catMap['necklaces'],
            tags: ['necklace', 'horseshoe', 'lucky', 'pave', 'statement'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plated Stainless Steel, Pavé Cubic Zirconia',
            care_instructions: 'Anti-tarnish guarantee. Safe for showers and gym workouts.',
            features: ['Channel-Set Baguette & Round Stones', 'Double-Sided High Mirror Polish', 'Tarnish-Proof Coating'],
            is_featured: true,
            rating: 4.7,
            review_count: 22,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 1799,
            compare_at_price: 2299,
            cost_price: 600,
            inventory: 40,
            images: [CLOUDINARY_IMAGES.cascade_layers, CLOUDINARY_IMAGES.hero_flatlay]
        },
        {
            title: 'Celestial Pavé North Star Layering Necklace',
            slug: 'celestial-pave-north-star-layering-necklace',
            description: 'A dazzling multi-point starburst pendant adorned with twinkling pavé diamonds, suspended from a textured oval paperclip layering chain.',
            product_type: 'Necklace',
            category_id: subCatMap['chains-layering'] || catMap['necklaces'],
            tags: ['necklace', 'star', 'celestial', 'layering', 'paperclip chain'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plated Stainless Steel',
            care_instructions: 'Wipe with microfiber cloth to restore shine.',
            features: ['Star Silhouette with Micro Pavé', 'Layer-Ready Chain Length (42cm + 5cm)', 'Lead-Free & Hypoallergenic'],
            is_featured: false,
            rating: 4.9,
            review_count: 17,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 1849,
            compare_at_price: 2399,
            cost_price: 620,
            inventory: 28,
            images: [CLOUDINARY_IMAGES.cascade_layers, CLOUDINARY_IMAGES.charms_pendants]
        },
        {
            title: 'Aura Turquoise Sunburst Solitaire Necklace',
            slug: 'aura-turquoise-sunburst-solitaire-necklace',
            description: 'Radiate energy with this celestial sun pendant centering a vibrant turquoise cabochon gemstone ringed with sparkling diamond rays.',
            product_type: 'Necklace',
            category_id: subCatMap['pendants-medallions'] || catMap['necklaces'],
            tags: ['necklace', 'turquoise', 'sunburst', 'gemstone', 'statement'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plating, Synthetic Turquoise & Clear CZ',
            care_instructions: 'Water-resistant. Avoid direct perfume spraying on the turquoise setting.',
            features: ['Vibrant Turquoise Center Stone', 'Radial Sunburst Setting', 'Ultra-Durable PVD Plating'],
            is_featured: true,
            rating: 5.0,
            review_count: 31,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 2199,
            compare_at_price: 2899,
            cost_price: 780,
            inventory: 50,
            images: [CLOUDINARY_IMAGES.cuff_shell, CLOUDINARY_IMAGES.cascade_layers]
        },
        {
            title: 'Lumière Dual-Band Gemstone Gold Cuff',
            slug: 'lumiere-dual-band-gemstone-gold-cuff',
            description: 'Architectural minimalism meets glamour. This sculpted open cuff features two parallel parallel high-polish 18K gold bands offset with a bezel-set brilliant round diamond and cushion-cut crystal.',
            product_type: 'Bracelet',
            category_id: subCatMap['sculpted-cuffs'] || catMap['bracelets'],
            tags: ['bracelet', 'cuff', 'bangle', 'gemstone', 'minimalist', 'bestseller'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plated Solid Stainless Steel, Bezel Cubic Zirconia',
            care_instructions: '100% waterproof and sweatproof. Ideal for everyday wear.',
            features: ['Dual-Parallel Band Architecture', 'Bezel-Set Solitaire & Cushion Crystals', 'Slightly Adjustable Open Fit'],
            is_featured: true,
            rating: 5.0,
            review_count: 42,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 2499,
            compare_at_price: 3299,
            cost_price: 890,
            inventory: 60,
            images: [CLOUDINARY_IMAGES.cuff_shell, CLOUDINARY_IMAGES.hero_flatlay]
        },
        {
            title: 'Baroque Pearl Paperclip Chain Bracelet',
            slug: 'baroque-pearl-paperclip-chain-bracelet',
            description: 'Modern sophistication. Sleek elongated paperclip links intertwined with clusters of luminous mini freshwater pearls and an eye-catching toggle clasp.',
            product_type: 'Bracelet',
            category_id: subCatMap['chain-pearl-bracelets'] || catMap['bracelets'],
            tags: ['bracelet', 'pearl', 'paperclip', 'gold bracelet'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plating, Natural Baroque Pearls',
            care_instructions: 'Water-friendly. Gently wipe with dry cloth after exposure to seawater.',
            features: ['Freshwater Cultured Pearls', 'Contemporary Paperclip Link', 'Secure Toggle Bar Closure'],
            is_featured: false,
            rating: 4.8,
            review_count: 15,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 1599,
            compare_at_price: 1999,
            cost_price: 520,
            inventory: 35,
            images: [CLOUDINARY_IMAGES.hero_flatlay, CLOUDINARY_IMAGES.cuff_shell]
        },
        {
            title: 'Monarch Golden Butterfly Wing Pendant',
            slug: 'monarch-golden-butterfly-wing-pendant',
            description: 'Symbol of freedom and metamorphosis. A delicate filigree butterfly wing pendant suspended horizontally on an ultra-fine diamond-cut ball chain.',
            product_type: 'Necklace',
            category_id: subCatMap['pendants-medallions'] || catMap['necklaces'],
            tags: ['necklace', 'butterfly', 'filigree', 'delicate', 'everyday'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plating on 316L Stainless Steel',
            care_instructions: 'Anti-tarnish, corrosion-resistant, hypoallergenic.',
            features: ['Fine Filigree Wing Texture', 'Diamond-Cut Satellite Bead Chain', 'Spring Ring Clasp'],
            is_featured: true,
            rating: 4.9,
            review_count: 24,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 1749,
            compare_at_price: 2299,
            cost_price: 590,
            inventory: 40,
            images: [CLOUDINARY_IMAGES.hero_flatlay, CLOUDINARY_IMAGES.charms_pendants]
        },
        {
            title: 'Elysian Roman Coin & Pearl Layering Set',
            slug: 'elysian-roman-coin-pearl-layering-set',
            description: 'The definitive vintage-inspired stack. An authentic relief-carved antique coin pendant paired with a freshwater pearl drop on a dual-strand mixed link chain.',
            product_type: 'Necklace',
            category_id: subCatMap['chains-layering'] || catMap['necklaces'],
            tags: ['necklace', 'coin', 'vintage', 'pearl', 'set', 'bestseller'],
            status: 'active',
            brand: 'Lily Luxora',
            material: '18K PVD Gold Plating, Cultured Freshwater Pearl',
            care_instructions: 'Built for longevity. Never fades, discolors, or turns skin green.',
            features: ['Double-Strand Layered Look', 'Antique Relief Coin Medallion', 'High Mirror Polish'],
            is_featured: true,
            rating: 5.0,
            review_count: 36,
            gender: 'Women',
            collection: 'Everyday Demi-Fine',
            is_free_delivery: true,
            price: 2299,
            compare_at_price: 2999,
            cost_price: 820,
            inventory: 55,
            images: [CLOUDINARY_IMAGES.hero_flatlay, CLOUDINARY_IMAGES.cascade_layers]
        }
    ];

    for (const p of productsData) {
        // 1. Insert or update product
        const { data: prod, error: prodErr } = await supabase
            .from('products')
            .upsert({
                title: p.title,
                slug: p.slug,
                description: p.description,
                product_type: p.product_type,
                category_id: p.category_id,
                tags: p.tags,
                status: p.status,
                brand: p.brand,
                material: p.material,
                care_instructions: p.care_instructions,
                features: p.features,
                is_featured: p.is_featured,
                rating: p.rating,
                review_count: p.review_count,
                gender: p.gender,
                collection: p.collection,
                is_free_delivery: p.is_free_delivery
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (prodErr) {
            console.error(`Error inserting product ${p.title}:`, prodErr);
            continue;
        }

        // 2. Insert or update default variant
        let variant;
        const { data: existingVariant } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', prod.id)
            .maybeSingle();

        if (existingVariant) {
            const { data: updVar, error: varErr } = await supabase
                .from('product_variants')
                .update({
                    price: p.price,
                    compare_at_price: p.compare_at_price,
                    cost_price: p.cost_price,
                    is_active: true,
                    sellable_status: 'sellable'
                })
                .eq('id', existingVariant.id)
                .select()
                .single();
            if (varErr) console.error('Var update error:', varErr);
            variant = updVar;
        } else {
            const { data: insVar, error: varErr } = await supabase
                .from('product_variants')
                .insert({
                    product_id: prod.id,
                    title: 'Default Variant',
                    sellable_status: 'sellable',
                    is_default: true,
                    sku: `LL-${prod.slug.substring(0, 10).toUpperCase()}-${Math.floor(100 + Math.random()*900)}`,
                    price: p.price,
                    compare_at_price: p.compare_at_price,
                    cost_price: p.cost_price,
                    is_active: true
                })
                .select()
                .single();
            if (varErr) console.error('Var insert error:', varErr);
            variant = insVar;
        }

        if (!variant) {
            console.error(`Variant missing for ${p.title}`);
            continue;
        }

        // 3. Clear existing media & add fresh media
        await supabase.from('product_media').delete().eq('product_id', prod.id);
        const mediaEntries = p.images.map((imgUrl, idx) => ({
            product_id: prod.id,
            media_url: imgUrl,
            media_type: 'image',
            position: idx + 1
        }));
        await supabase.from('product_media').insert(mediaEntries);

        // 4. Update inventory
        const { data: existingInv } = await supabase
            .from('inventory_items')
            .select('id')
            .eq('variant_id', variant.id)
            .eq('location_id', WAREHOUSE_ID)
            .maybeSingle();

        if (existingInv) {
            await supabase
                .from('inventory_items')
                .update({ available_quantity: p.inventory })
                .eq('id', existingInv.id);
        } else {
            await supabase
                .from('inventory_items')
                .insert({
                    variant_id: variant.id,
                    location_id: WAREHOUSE_ID,
                    available_quantity: p.inventory,
                    reserved_quantity: 0
                });
        }

        console.log(`✓ Product created: "${p.title}" (₹${p.price}, Stock: ${p.inventory})`);
    }

    console.log('--- 3. Updating Homepage Hero Banner & Slides in app_settings ---');
    const heroSlides = [
        {
            id: 'hero-1',
            badgeText: 'NEW COLLECTION 2026',
            title: 'Golden Radiance.',
            highlightText: 'Demi-Fine Luxury.',
            description: 'Handcrafted 18K PVD gold-plated jewellery designed for effortless everyday wear. Waterproof, anti-tarnish, and hypoallergenic.',
            ctaLabel: 'Shop The Edit',
            ctaHref: '/category',
            imageUrl: CLOUDINARY_IMAGES.hero_flatlay,
            mobileImageUrl: CLOUDINARY_IMAGES.hero_flatlay
        },
        {
            id: 'hero-2',
            badgeText: 'CHARM & PENDANTS',
            title: 'Sculpted Symbols.',
            highlightText: 'Made To Layer.',
            description: 'From pavé cherry charms to radiant sunburst medallions, find timeless pieces that tell your personal story.',
            ctaLabel: 'Explore Necklaces',
            ctaHref: '/category/necklaces',
            imageUrl: CLOUDINARY_IMAGES.charms_pendants,
            mobileImageUrl: CLOUDINARY_IMAGES.charms_pendants
        },
        {
            id: 'hero-3',
            badgeText: 'WRISTWEAR ESSENTIALS',
            title: 'Architectural Cuffs.',
            highlightText: 'Modern Elegance.',
            description: 'Discover the Lumière Gemstone Cuff and Baroque Pearl chains designed to catch the light from every angle.',
            ctaLabel: 'View Bracelets',
            ctaHref: '/category/bracelets',
            imageUrl: CLOUDINARY_IMAGES.cuff_shell,
            mobileImageUrl: CLOUDINARY_IMAGES.cuff_shell
        }
    ];

    const { data: settingsData, error: settingsErr } = await supabase
        .from('app_settings')
        .update({
            homepage_slides: heroSlides,
            hero_badge_text: heroSlides[0].badgeText,
            hero_title: heroSlides[0].title,
            hero_highlight_text: heroSlides[0].highlightText,
            hero_description: heroSlides[0].description,
            hero_cta_label: heroSlides[0].ctaLabel,
            hero_cta_href: heroSlides[0].ctaHref,
            hero_image_url: heroSlides[0].imageUrl,
            announcement_bar_enabled: true,
            announcement_text: '✨ Free Pan-India Express Delivery on All Orders Above ₹999 | 100% Waterproof & Anti-Tarnish Guaranteed',
            announcement_background: '#382F2A',
            announcement_text_color: '#F7F3ED',
            promise_kicker_text: 'The Lily Luxora Promise',
            promise_title: 'Demi-Fine Gold That Lasts.',
            promise_description: 'Every single piece is triple-coated in 18K PVD gold over surgical stainless steel. Tested for daily wear, perfumes, showers, and ocean dips with zero tarnishing.',
            promise_image_url: CLOUDINARY_IMAGES.cascade_layers,
            updated_at: new Date().toISOString()
        })
        .eq('id', '6c4903a0-2ed6-40df-8752-03d48fb140c7');

    if (settingsErr) {
        console.error('Error updating app_settings banner:', settingsErr);
    } else {
        console.log('✓ Successfully updated hero slides, announcement bar, and banners in app_settings.');
    }

    console.log('--- SEED COMPLETED SUCCESSFULLY! ---');
}

seed().catch(err => {
    console.error('Fatal error during seed:', err);
});
