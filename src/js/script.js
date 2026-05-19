/**
 * Quebrada Original - Shopify Integration
 * Main JavaScript file for e-commerce functionality
 */

// Shopify Store Configuration
const SHOPIFY_CONFIG = {
    storefrontAccessToken: 'YOUR_STOREFRONT_ACCESS_TOKEN', // Replace with your token
    shopDomain: 'your-store.myshopify.com', // Replace with your domain
};

// Shopify GraphQL Endpoint
const SHOPIFY_GRAPHQL_ENDPOINT = `https://${SHOPIFY_CONFIG.shopDomain}/api/2024-01/graphql.json`;

/**
 * Fetch wrapper for Shopify API calls
 */
async function shopifyFetch(query, variables = {}) {
    try {
        const response = await fetch(SHOPIFY_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Shopify API Error:', error);
        throw error;
    }
}

/**
 * Menu Toggle Function
 */
function myMenuFunction() {
    const navDropdownMenu = document.getElementById('navDropdownMenu');
    if (navDropdownMenu) {
        navDropdownMenu.classList.toggle('responsive');
    }
}

/**
 * Add Product to Cart
 */
async function addToCart(variantId, quantity = 1) {
    try {
        const cart = await getOrCreateCart();
        const mutation = `
            mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
                cartLinesAdd(cartId: $cartId, lines: $lines) {
                    cart {
                        id
                        lines(first: 10) {
                            edges {
                                node {
                                    id
                                    quantity
                                    merchandise {
                                        ... on ProductVariant {
                                            id
                                            title
                                        }
                                    }
                                }
                            }
                        }
                        cost {
                            totalAmount {
                                amount
                                currencyCode
                            }
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;
        
        const response = await shopifyFetch(mutation, {
            cartId: cart.id,
            lines: [
                {
                    merchandiseId: variantId,
                    quantity,
                },
            ],
        });
        
        if (response.data?.cartLinesAdd) {
            console.log('Product added to cart successfully');
            updateCartUI(response.data.cartLinesAdd.cart);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

/**
 * Get or Create Cart
 */
async function getOrCreateCart() {
    let cartId = localStorage.getItem('shopify_cart_id');
    
    if (cartId) {
        return { id: cartId };
    }
    
    const mutation = `
        mutation CreateCart {
            cartCreate {
                cart {
                    id
                }
            }
        }
    `;
    
    const response = await shopifyFetch(mutation);
    cartId = response.data?.cartCreate?.cart?.id;
    
    if (cartId) {
        localStorage.setItem('shopify_cart_id', cartId);
        return { id: cartId };
    }
    
    throw new Error('Failed to create cart');
}

/**
 * Update Cart UI
 */
function updateCartUI(cart) {
    const cartCount = cart.lines?.edges?.length || 0;
    const totalPrice = cart.cost?.totalAmount?.amount || 0;
    
    // Update cart icon with count
    const cartIcons = document.querySelectorAll('[data-cart-icon]');
    cartIcons.forEach(icon => {
        icon.setAttribute('data-cart-count', cartCount);
    });
    
    console.log(`Cart updated: ${cartCount} items - Total: ${totalPrice}`);
}

/**
 * Fetch Products from Shopify
 */
async function fetchProducts(first = 10) {
    const query = `
        query GetProducts($first: Int!) {
            products(first: $first) {
                edges {
                    node {
                        id
                        title
                        description
                        images(first: 1) {
                            edges {
                                node {
                                    url
                                    altText
                                }
                            }
                        }
                        variants(first: 1) {
                            edges {
                                node {
                                    id
                                    title
                                    priceV2 {
                                        amount
                                        currencyCode
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    
    try {
        const response = await shopifyFetch(query, { first });
        return response.data?.products?.edges || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Initialize Cart Buttons
 */
function initializeCartButtons() {
    const cartButtons = document.querySelectorAll('[data-add-to-cart]');
    cartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const variantId = this.getAttribute('data-variant-id');
            if (variantId) {
                addToCart(variantId);
            }
        });
    });
}

/**
 * Initialize on DOM Ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeCartButtons();
    console.log('Quebrada Original - Shopify Integration Initialized');
});

// Export functions for use in HTML
window.addToCart = addToCart;
window.myMenuFunction = myMenuFunction;
window.fetchProducts = fetchProducts;
