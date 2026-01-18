import { Injectable, signal, computed } from '@angular/core';
import { Investment, InvestmentType, RiskLevel } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private _investments = signal<Investment[]>([]);
  readonly investments = this._investments.asReadonly();

  constructor() {
    this.fetchInvestments();
  }

  private fetchInvestments() {
    this._investments.set(this.getMockInvestments());
  }

  toggleFavorite(investmentToToggle: Investment) {
    const updatedInvestment = { ...investmentToToggle, favorited: !investmentToToggle.favorited };

    // Update the UI state directly. No backend call.
    this._investments.update(investments =>
      investments.map(inv =>
        inv.id === investmentToToggle.id ? updatedInvestment : inv
      )
    );
  }

  getInvestmentById(id: number) {
    return computed(() => this.investments().find(inv => inv.id === id));
  }

  private getMockInvestments(): Investment[] {
    return [
      {
        id: 1,
        name: 'Quantum Leap AI',
        type: InvestmentType.Stock,
        author: 'TechVanguard',
        authorImage: 'https://picsum.photos/seed/tech/100/100',
        score: 95,
        description: 'Next-generation quantum computing processors specifically designed for AI model training acceleration.',
        riskLevel: RiskLevel.High,
        targetFund: 5000000,
        currentFund: 3250000,
        favorited: false,
        investors: [
          { name: 'Alice', imageUrl: 'https://picsum.photos/seed/p1/50/50' },
          { name: 'Bob', imageUrl: 'https://picsum.photos/seed/p2/50/50' }
        ],
        investedAmount: 25000,
        isOwnProject: true
      },
      {
        id: 2,
        name: 'GreenEarth Energy Bond',
        type: InvestmentType.Fund,
        author: 'EcoGlobal',
        authorImage: 'https://picsum.photos/seed/eco/100/100',
        score: 88,
        description: 'Sustainable energy infrastructure projects focused on solar and wind farm expansion in developing nations.',
        riskLevel: RiskLevel.Low,
        targetFund: 10000000,
        currentFund: 8500000,
        favorited: true,
        investors: [
          { name: 'Charlie', imageUrl: 'https://picsum.photos/seed/p3/50/50' },
          { name: 'Dave', imageUrl: 'https://picsum.photos/seed/p4/50/50' },
          { name: 'Eve', imageUrl: 'https://picsum.photos/seed/p5/50/50' }
        ],
        investedAmount: 50000
      },
      {
        id: 3,
        name: 'DeFi ChainLink',
        type: InvestmentType.Crypto,
        author: 'BlockGenius',
        authorImage: 'https://picsum.photos/seed/crypto/100/100',
        score: 92,
        description: 'Decentralized oracle network connecting smart contracts with real-world data.',
        riskLevel: RiskLevel.Medium,
        targetFund: 2000000,
        currentFund: 1800000,
        favorited: false,
        investors: [
          { name: 'Frank', imageUrl: 'https://picsum.photos/seed/p6/50/50' }
        ],
        investedAmount: 15000
      },
      {
        id: 4,
        name: 'MedTech Innovations',
        type: InvestmentType.Stock,
        author: 'HealthCorp',
        authorImage: 'https://picsum.photos/seed/med/100/100',
        score: 85,
        description: 'AI-driven diagnostic tools for early detection of chronic diseases.',
        riskLevel: RiskLevel.Medium,
        targetFund: 3000000,
        currentFund: 1200000,
        favorited: false,
        investors: []
      },
      {
        id: 5,
        name: 'SpaceX Logistics',
        type: InvestmentType.Stock,
        author: 'OrbitDyna',
        authorImage: 'https://picsum.photos/seed/space/100/100',
        score: 98,
        description: 'Commercial payload delivery services to Low Earth Orbit and beyond.',
        riskLevel: RiskLevel.High,
        targetFund: 15000000,
        currentFund: 4500000,
        favorited: true,
        investors: [
           { name: 'Grace', imageUrl: 'https://picsum.photos/seed/p7/50/50' },
           { name: 'Heidi', imageUrl: 'https://picsum.photos/seed/p8/50/50' }
        ]
      },
      {
        id: 6,
        name: 'Eco-Friendly Packaging',
        type: InvestmentType.Fund,
        author: 'TechVanguard', // Same author as the founder
        authorImage: 'https://picsum.photos/seed/tech/100/100',
        score: 82,
        description: 'Biodegradable packaging solutions made from plant-based materials to reduce plastic waste.',
        riskLevel: RiskLevel.Low,
        targetFund: 1500000,
        currentFund: 950000,
        favorited: false,
        investors: [
          { name: 'Investor A', imageUrl: 'https://picsum.photos/seed/invA/50/50' },
          { name: 'Investor B', imageUrl: 'https://picsum.photos/seed/invB/50/50' },
        ],
        investedAmount: 0,
        isOwnProject: true
      },
      {
        id: 7,
        name: 'Smart Home Hub',
        type: InvestmentType.Stock,
        author: 'TechVanguard', // Same author as the founder
        authorImage: 'https://picsum.photos/seed/tech/100/100',
        score: 91,
        description: 'A universal smart home controller that uses AI to learn user habits and automate home environments.',
        riskLevel: RiskLevel.Medium,
        targetFund: 4000000,
        currentFund: 1100000,
        favorited: false,
        investors: [
          { name: 'Investor C', imageUrl: 'https://picsum.photos/seed/invC/50/50' },
          { name: 'Investor D', imageUrl: 'https://picsum.photos/seed/invD/50/50' },
          { name: 'Investor E', imageUrl: 'https://picsum.photos/seed/invE/50/50' },
        ],
        investedAmount: 0,
        isOwnProject: true
      }
    ];
  }
}