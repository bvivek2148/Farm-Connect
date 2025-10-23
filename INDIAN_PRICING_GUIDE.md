# Indian Agricultural Product Pricing Guide

This document provides realistic Indian Rupee (₹) prices for agricultural products in the Farm Connect marketplace.

## Pricing Philosophy
All prices are in Indian Rupees (₹) and reflect typical market rates for fresh, locally-sourced agricultural products in India. Prices may vary based on:
- Seasonal availability
- Organic certification
- Geographic location
- Quality grade

## Common Product Prices (per kg unless specified)

### Vegetables
- **Tomatoes**: ₹40-80/kg
- **Onions**: ₹30-60/kg
- **Potatoes**: ₹25-50/kg
- **Carrots**: ₹50-80/kg
- **Cabbage**: ₹30-50/kg
- **Cauliflower**: ₹40-70/kg
- **Brinjal (Eggplant)**: ₹40-70/kg
- **Capsicum (Bell Pepper)**: ₹60-100/kg
- **Spinach**: ₹40-60/kg (per bunch)
- **Coriander**: ₹30-50/kg
- **Green Chillies**: ₹50-100/kg
- **Beans**: ₹60-100/kg
- **Okra (Bhindi)**: ₹50-80/kg

### Fruits
- **Apples**: ₹120-180/kg
- **Bananas**: ₹40-60/dozen
- **Oranges**: ₹60-100/kg
- **Mangoes (seasonal)**: ₹80-200/kg
- **Grapes**: ₹80-150/kg
- **Pomegranate**: ₹150-250/kg
- **Papaya**: ₹30-50/kg
- **Watermelon**: ₹20-40/kg
- **Guava**: ₹40-80/kg

### Grains & Pulses
- **Rice (premium)**: ₹60-100/kg
- **Wheat**: ₹30-50/kg
- **Toor Dal**: ₹120-150/kg
- **Moong Dal**: ₹100-130/kg
- **Chana Dal**: ₹80-110/kg
- **Rajma**: ₹150-200/kg

### Dairy Products
- **Fresh Milk**: ₹50-70/liter
- **Paneer**: ₹350-450/kg
- **Curd**: ₹50-70/kg
- **Ghee**: ₹500-700/kg
- **Butter**: ₹400-550/kg

### Eggs & Poultry
- **Free-range Eggs**: ₹80-120/dozen
- **Farm Eggs**: ₹60-90/dozen
- **Chicken (farm-raised)**: ₹200-280/kg
- **Country Chicken**: ₹350-450/kg

### Organic Premium
Organic products typically cost 20-40% more than conventional products:
- **Organic Vegetables**: +30% premium
- **Organic Fruits**: +35% premium
- **Organic Grains**: +40% premium
- **Organic Dairy**: +25% premium

## Subscription Pricing Tiers

### Basic Plan
**₹299/month**
- 5 orders per month
- Standard delivery
- 5% discount on all orders

### Premium Plan
**₹599/month**
- 15 orders per month
- Priority delivery
- 10% discount on all orders
- Early access to seasonal products

### Family Plan
**₹999/month**
- Unlimited orders
- Express delivery (same/next day)
- 15% discount on all orders
- Early access to seasonal products
- Free organic samples monthly
- Dedicated customer support

## Implementation Notes

1. **Database Storage**: Store all prices as DECIMAL(10,2) in the database
2. **Display Format**: Use `formatINR()` function to display prices with ₹ symbol
3. **No Conversion**: Prices are stored and displayed directly in INR - no USD conversion needed
4. **Seasonal Adjustments**: Prices for seasonal items should be updated quarterly
5. **Regional Variations**: Consider adding regional pricing based on location

## Example Product Entries

```typescript
{
  name: "Organic Tomatoes",
  price: 80,
  unit: "kg",
  category: "vegetables"
}

{
  name: "Farm Fresh Milk",
  price: 65,
  unit: "liter",
  category: "dairy"
}

{
  name: "Free-range Eggs",
  price: 95,
  unit: "dozen",
  category: "eggs"
}
```

## Currency Display

Always use the `formatINR()` utility function:

```typescript
import { formatINR } from "@/lib/utils";

// Display price
const displayPrice = formatINR(80); // Output: ₹80
const displayPrice2 = formatINR(1250); // Output: ₹1,250
```

## Notes for Developers

- All prices in the database should be in INR
- Remove any USD to INR conversion functions from components
- Use Indian city names and PIN codes for addresses
- Ensure payment methods include UPI, Net Banking, and Cards
- Default currency symbol: ₹ (Rupee)

## Last Updated
January 2024
