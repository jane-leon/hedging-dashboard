import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

def collar_strategy(current_price, put_strike, call_strike, put_premium, call_premium, 
                   expiration_date=None, num_shares=100):
    """
    Calculate collar strategy metrics and generate payoff chart.
    
    Parameters:
    - current_price: Current stock price
    - put_strike: Strike price of protective put
    - call_strike: Strike price of covered call
    - put_premium: Premium paid for put (positive value)
    - call_premium: Premium received for call (positive value)
    - expiration_date: Optional expiration date (not used in calculations)
    - num_shares: Number of shares (default 100)
    
    Returns:
    - Dictionary with max_loss, max_gain, breakeven, net_cost, and payoff chart
    """
    
    # Net premium (negative = paid, positive = received)
    net_premium = (call_premium - put_premium) * num_shares
    
    # Max Loss: (Put Strike - Current Price) - Net Premium Received
    max_loss = ((put_strike - current_price) * num_shares) - net_premium
    
    # Max Gain: (Call Strike - Current Price) - Net Premium Paid
    max_gain = ((call_strike - current_price) * num_shares) - net_premium
    
    # Breakeven: Current Price - Net Premium per share
    breakeven = current_price - (net_premium / num_shares)
    
    # Net Cost (negative = you pay, positive = you receive)
    net_cost = net_premium
    
    # Generate payoff chart
    price_range = np.linspace(current_price * 0.5, current_price * 1.5, 100)
    payoffs = []
    
    for price in price_range:
        # Stock position P&L
        stock_pl = (price - current_price) * num_shares
        
        # Put option P&L (long put)
        put_pl = max(put_strike - price, 0) * num_shares - (put_premium * num_shares)
        
        # Call option P&L (short call)
        call_pl = (call_premium * num_shares) - max(price - call_strike, 0) * num_shares
        
        # Total P&L
        total_pl = stock_pl + put_pl + call_pl
        payoffs.append(total_pl)
    
    # Create payoff chart
    plt.figure(figsize=(10, 6))
    plt.plot(price_range, payoffs, linewidth=2, color='blue')
    plt.axhline(y=0, color='black', linestyle='--', linewidth=0.8)
    plt.axvline(x=current_price, color='gray', linestyle='--', linewidth=0.8, label=f'Current Price: ${current_price}')
    plt.axvline(x=breakeven, color='red', linestyle='--', linewidth=0.8, label=f'Breakeven: ${breakeven:.2f}')
    plt.axvline(x=put_strike, color='orange', linestyle=':', linewidth=0.8, label=f'Put Strike: ${put_strike}')
    plt.axvline(x=call_strike, color='green', linestyle=':', linewidth=0.8, label=f'Call Strike: ${call_strike}')
    
    plt.xlabel('Future Stock Price ($)', fontsize=12)
    plt.ylabel('Net Profit/Loss ($)', fontsize=12)
    plt.title('Collar Strategy Payoff Diagram', fontsize=14, fontweight='bold')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    
    return {
        'max_loss': max_loss,
        'max_gain': max_gain,
        'breakeven': breakeven,
        'net_cost': net_cost,
        'num_shares': num_shares,
        'chart': plt
    }


def print_collar_results(results):
    """Print formatted results from collar strategy calculation."""
    
    print("=" * 50)
    print("COLLAR STRATEGY ANALYSIS")
    print("=" * 50)
    print(f"Number of Shares: {results['num_shares']}")
    print(f"\nNet Cost: ${results['net_cost']:.2f}")
    if results['net_cost'] < 0:
        print("  → You PAY this amount (net debit)")
    else:
        print("  → You RECEIVE this amount (net credit)")
    
    print(f"\nBreakeven Price: ${results['breakeven']:.2f}")
    print(f"\nMax Loss: ${results['max_loss']:.2f}")
    print(f"Max Gain: ${results['max_gain']:.2f}")
    print("=" * 50)


# Example usage:
#if __name__ == "__main__":
#    results = collar_strategy(
#        current_price=100,
#        put_strike=95,
#        call_strike=110,
#        put_premium=3,
#        call_premium=2,
#        num_shares=100
#    )
    
#    print_collar_results(results)
#    results['chart'].show()

def futures_contract_dashboard(current_price,futures_price,contract_size):
    """
    Interactive dashboard for analyzing futures contract P&L
    """
    
    # Calculate breakeven
    breakeven = futures_price
    
    # Calculate P&L per dollar move
    pl_per_dollar = contract_size
    
    # Generate spot price range for payoff chart
    price_range = np.linspace(current_price * 0.5, current_price * 1.5, 100)
    
    # Calculate P&L for each spot price
    # P&L = (Spot - Futures Price) × Contract Size
    pl_values = (price_range - futures_price) * contract_size
    
    # Display results
    print("\n=== RESULTS ===")
    print(f"Breakeven Price: ${breakeven:.2f}")
    print(f"P&L per $1 move: ${pl_per_dollar:.2f}")
    print(f"\nFor each $1 move in the asset, you gain/lose ${pl_per_dollar:.2f}")
    
    # Calculate max gain/loss at extreme prices
    max_price = current_price * 1.5
    min_price = current_price * 0.5
    max_gain = (max_price - futures_price) * contract_size
    max_loss = (min_price - futures_price) * contract_size
    
    print(f"\nAt spot price ${max_price:.2f}: P&L = ${max_gain:.2f}")
    print(f"At spot price ${min_price:.2f}: P&L = ${max_loss:.2f}")
    
    # Create payoff chart
    plt.figure(figsize=(10, 6))
    plt.plot(price_range, pl_values, linewidth=2, color='blue', label='P&L')
    plt.axhline(y=0, color='black', linestyle='--', linewidth=0.8)
    plt.axvline(x=futures_price, color='red', linestyle='--', linewidth=0.8, 
                label=f'Breakeven (${futures_price:.2f})')
    plt.axvline(x=current_price, color='green', linestyle=':', linewidth=0.8, 
                label=f'Current Price (${current_price:.2f})')
    
    plt.xlabel('Spot Price ($)', fontsize=12)
    plt.ylabel('Profit/Loss ($)', fontsize=12)
    plt.title('Futures Contract Payoff Diagram', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.legend()
    
    # Add annotations
    plt.annotate(f'Breakeven: ${breakeven:.2f}', 
                xy=(futures_price, 0), 
                xytext=(futures_price, max(pl_values)*0.3),
                arrowprops=dict(arrowstyle='->', color='red'),
                fontsize=10)
    
    plt.tight_layout()
    plt.show()
    
    return {
        'current_price': current_price,
        'futures_price': futures_price,
        'contract_size': contract_size,
        'breakeven': breakeven,
        'pl_per_dollar': pl_per_dollar
    }