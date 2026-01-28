// Fix: Import `signal` from @angular/core to create signals for component state.
import { Component, ChangeDetectionStrategy, inject, ElementRef, viewChild, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InvestmentService } from '../../../services/investment.service';
import { LanguageService } from '../../../services/language.service';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { AuthService } from '../../../services/auth.service';
import { ProfileService } from '../../../services/profile.service';
import { UserService } from '../../../services/user.service';
import { Investment } from '../../../models/investment.model';
import { NotificationService } from '../../../services/notification.service';
import { TIME_INTERVALS } from '../../../config/constants';
import { get } from 'lodash-es';

declare var d3: any;

interface ChartData {
  name: string;
  value: number;
}

interface BarChartData {
  label: string;
  value: number;
}

interface Activity {
  type: 'investment' | 'watchlist' | 'milestone';
  text: string;
  time: string;
  imageUrl?: string;
}


interface LineChartData {
  month: string;
  value: number;
}

interface D3PieArcDatum {
  data: ChartData;
}

interface SentRequest {
  id: number;
  projectName: string;
  projectImageUrl: string;
  author: string;
  status: 'Pending' | 'Negotiating' | 'Partner' | 'Rejected';
  date: Date;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslatePipe, RouterLink]
})
export class DashboardComponent {
  private investmentService = inject(InvestmentService);
  private languageService = inject(LanguageService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  private t(path: string, fallback: string): string {
    return get(this.languageService.dictionary(), path, fallback);
  }
  
  pieChart = viewChild<ElementRef>('pieChart');
  lineChart = viewChild<ElementRef>('lineChart');
  barChart = viewChild<ElementRef>('barChart');
  
  userRole = this.authService.userRole;
  allInvestments = this.investmentService.investments;

  // --- Investor-specific computed signals ---
  myInvestments = computed(() => this.allInvestments().filter(inv => (inv.investedAmount ?? 0) > 0));
  portfolioValue = computed(() => this.myInvestments().reduce((sum, inv) => sum + (inv.investedAmount ?? 0), 0));
  favoriteInvestments = computed(() => this.allInvestments().filter(inv => inv.favorited));
  featuredInvestments = computed(() => this.allInvestments().sort((a, b) => b.credibilityScore - a.credibilityScore).slice(0, 3));
  investorScore = signal(85);
  availableCredits = this.userService.credits; // Use UserService for credits
  
  // --- Founder-specific computed signals & data ---
  founderProjects = computed(() => {
    const uid = this.profileService.profile()?.userId;
    if (!uid) return [] as Investment[];
    return this.allInvestments().filter(inv => inv.founderId === uid);
  });
  selectedFounderProject = signal<Investment | null>(null);

  fundingProgress = computed(() => {
    const p = this.selectedFounderProject();
    if (!p || (p.targetFund ?? 0) === 0) return 0;
    return ((p.currentFunding ?? 0) / (p.targetFund ?? 1)) * 100;
  });
  
  // Mock data for founder dashboard
  projectViews = signal(12845);
  engagementScore = signal(88);
  recentActivity = signal<Activity[]>([
    { type: 'investment', text: 'Sarah J. invested $5,000', time: '2h ago', imageUrl: 'https://picsum.photos/seed/person1/50/50' },
    { type: 'watchlist', text: 'Michael B. added your project to their watchlist', time: '8h ago', imageUrl: 'https://picsum.photos/seed/person2/50/50' },
    { type: 'milestone', text: 'Congratulations! You reached 65% of your funding goal.', time: '1d ago' },
    { type: 'investment', text: 'Frank G. invested $1,500', time: '2d ago', imageUrl: 'https://picsum.photos/seed/p6/50/50' },
  ]);

  sentRequests = signal<SentRequest[]>([
    { id: 1, projectName: 'GreenEarth Energy Bond', projectImageUrl: 'https://picsum.photos/seed/eco/100/100', author: 'EcoGlobal', status: 'Pending', date: new Date(Date.now() - 3600 * 1000 * 6) },
    { id: 2, projectName: 'DeFi ChainLink', projectImageUrl: 'https://picsum.photos/seed/crypto/100/100', author: 'BlockGenius', status: 'Negotiating', date: new Date(Date.now() - 3600 * 1000 * 25) },
    { id: 4, projectName: 'Quantum Leap AI', projectImageUrl: 'https://picsum.photos/seed/tech/100/100', author: 'TechVanguard', status: 'Partner', date: new Date(Date.now() - 3600 * 1000 * 48) },
    { id: 3, projectName: 'MedTech Innovations', projectImageUrl: 'https://picsum.photos/seed/med/100/100', author: 'HealthCorp', status: 'Rejected', date: new Date(Date.now() - 3600 * 1000 * 72) },
  ]);

  requestToWithdraw = signal<SentRequest | null>(null);

  constructor() {
    effect(() => {
      const projects = this.founderProjects();
      // If there's only one project and none is selected, auto-select it.
      if (projects.length === 1 && !this.selectedFounderProject()) {
        this.selectProject(projects[0]);
      }
    });

    effect(() => {
      // This effect runs when view children are ready, role or language changes
      setTimeout(() => { // Allow view to render before drawing charts
        if (this.userRole() === 'investor') {
          if (this.pieChart() && this.lineChart()) {
            this.createPieChart();
            this.createLineChart();
          }
        } else if (this.userRole() === 'founder') {
           if (this.barChart() && this.selectedFounderProject()) {
            this.createBarChart();
          }
        }
      }, 0);
    });
  }

  selectProject(project: Investment) {
    this.selectedFounderProject.set(project);
  }

  unselectProject() {
    this.selectedFounderProject.set(null);
  }

  toggleFavorite(investment: Investment) {
    this.investmentService.toggleFavorite(investment);
  }

  promptWithdraw(request: SentRequest) {
    this.requestToWithdraw.set(request);
  }

  cancelWithdraw() {
    this.requestToWithdraw.set(null);
  }

  confirmWithdraw() {
    const request = this.requestToWithdraw();
    if (request) {
      this.sentRequests.update(requests => requests.filter(r => r.id !== request.id));
      
      const dictionary = this.languageService.dictionary();
      const titleTemplate = get(dictionary, 'dashboard.withdrawSuccess.title');
      const messageTemplate = get(dictionary, 'dashboard.withdrawSuccess.message');
      const message = messageTemplate.replace('{projectName}', request.projectName);

      this.notificationService.showToast({
        title: titleTemplate,
        message: message,
        type: 'success'
      });

      this.requestToWithdraw.set(null);
    }
  }
  
  getTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / TIME_INTERVALS.YEAR;
    if (interval > 1) {
      const years = Math.floor(interval);
      const key = years > 1 ? 'common.timeAgo.years' : 'common.timeAgo.year';
      return this.t(key, '{count} years ago').replace('{count}', String(years));
    }
    interval = seconds / TIME_INTERVALS.MONTH;
    if (interval > 1) {
      const months = Math.floor(interval);
      const key = months > 1 ? 'common.timeAgo.months' : 'common.timeAgo.month';
      return this.t(key, '{count} months ago').replace('{count}', String(months));
    }
    interval = seconds / TIME_INTERVALS.DAY;
    if (interval > 1) {
      const days = Math.floor(interval);
      const key = days > 1 ? 'common.timeAgo.days' : 'common.timeAgo.day';
      return this.t(key, '{count} days ago').replace('{count}', String(days));
    }
    interval = seconds / TIME_INTERVALS.HOUR;
    if (interval > 1) {
      const hours = Math.floor(interval);
      const key = hours > 1 ? 'common.timeAgo.hours' : 'common.timeAgo.hour';
      return this.t(key, '{count} hours ago').replace('{count}', String(hours));
    }
    interval = seconds / TIME_INTERVALS.MINUTE;
    if (interval > 1) {
      const minutes = Math.floor(interval);
      const key = minutes > 1 ? 'common.timeAgo.minutes' : 'common.timeAgo.minute';
      return this.t(key, '{count} minutes ago').replace('{count}', String(minutes));
    }
    const secs = Math.floor(seconds);
    const key = secs > 1 ? 'common.timeAgo.seconds' : 'common.timeAgo.second';
    return this.t(key, '{count} seconds ago').replace('{count}', String(secs));
  }

  // Fix: Correctly type `valueField` to ensure proper type inference for chart data.
  private getPieChartData(): ChartData[] {
    const investments = this.userRole() === 'investor' ? this.myInvestments() : this.allInvestments();
    const valueField: 'investedAmount' | 'currentFunding' = this.userRole() === 'investor' ? 'investedAmount' : 'currentFunding';

    // Fix: Replaced `reduce` with a `for...of` loop for clearer type handling and to resolve inference issues with the accumulator.
    const categoryTotals: Record<string, number> = {};
    for (const investment of investments) {
      const value = investment[valueField];
      const categoryName = investment.businessCategoryName || this.t('dashboard.uncategorized', 'Uncategorized');
      if (typeof value === 'number') {
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + value;
      }
    }

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }

  private getLineChartData(): LineChartData[] {
    // Mock data for personal portfolio performance
    return [
      { month: this.t('common.months.jan', 'Jan'), value: 78000 },
      { month: this.t('common.months.feb', 'Feb'), value: 81000 },
      { month: this.t('common.months.mar', 'Mar'), value: 85000 },
      { month: this.t('common.months.apr', 'Apr'), value: 83000 },
      { month: this.t('common.months.may', 'May'), value: 90000 },
      { month: this.t('common.months.jun', 'Jun'), value: 92000 },
      { month: this.t('common.months.jul', 'Jul'), value: 95000 },
      { month: this.t('common.months.aug', 'Aug'), value: 98000 },
    ];
  }

  private getBarChartData(): BarChartData[] {
     // Mock data for new investors over time
    return [
      { label: this.t('common.months.apr', 'Apr'), value: 5 },
      { label: this.t('common.months.may', 'May'), value: 8 },
      { label: this.t('common.months.jun', 'Jun'), value: 12 },
      { label: this.t('common.months.jul', 'Jul'), value: 7 },
      { label: this.t('common.months.aug', 'Aug'), value: 15 },
      { label: this.t('common.months.sep', 'Sep'), value: 11 },
    ];
  }
  
  private createBarChart(): void {
    const data = this.getBarChartData();
    const element = this.barChart()?.nativeElement;
    
    if (!element || element.clientWidth === 0) return;

    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
        
    const x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(d => d.label))
        .padding(0.4);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#94a3b8');

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.2])
        .range([height, 0]);

    svg.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text')
        .style('fill', '#94a3b8');
        
    svg.selectAll('.domain, .tick line').attr('stroke', '#374151');

    const barGradient = svg.append("defs").append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");
    barGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    barGradient.append("stop").attr("offset", "100%").attr("stop-color", "#8b5cf6");

    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.label))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "url(#bar-gradient)")
        .attr('rx', 4)
        .attr('ry', 4);
  }


  private createPieChart(): void {
    const data = this.getPieChartData();
    const element = this.pieChart()?.nativeElement;

    if (!element) return;
    
    d3.select(element).select('svg').remove();
    d3.select(element).select('.d3-tooltip').remove();
    
    if (data.length === 0) {
      element.innerHTML = `<div class="flex items-center justify-center h-full text-gray-500">No data to display</div>`;
      return;
    }
    element.innerHTML = ''; // Clear fallback text

    const width = 500;
    const height = 300;
    const radius = Math.min(height, height) / 2;
    const chartCenterY = height / 2;
    const lang = this.languageService.language();
    const chartCenterX = lang === 'ar' ? width - radius - 20 : radius + 20;

    const svg = d3.select(element)
      .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
        .attr('transform', `translate(${chartCenterX}, ${chartCenterY})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(['#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#ec4899']);

    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null);

    const data_ready = pie(data as any);

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.9);
      
    const tooltip = d3.select(element)
      .append('div')
      .attr('class', 'd3-tooltip absolute bg-slate-800 text-white text-sm rounded-lg py-1 px-3 shadow-lg pointer-events-none')
      .style('opacity', 0);

    // Role-aware label for tooltip (investor sees 'You invested')
    const userRole = this.userRole();
    const valueLabel = userRole === 'investor' ? 'You invested' : 'Amount';

    const sanitize = (name: string) => name.replace(/\s+/g, '-');

    svg
      .selectAll('allSlices')
      .data(data_ready)
      .join('path')
        .attr('d', arc)
        .attr('fill', (d: D3PieArcDatum) => color(d.data.name) as string)
        .attr('stroke', '#1e293b')
        .attr('id', (d: D3PieArcDatum) => `slice-${sanitize(d.data.name)}`)
        .style('stroke-width', '2px')
        .style('opacity', 0.8)
        .style('transition', 'opacity 0.2s ease-in-out')
        .on('mouseover', function(event: MouseEvent, d: D3PieArcDatum) {
            d3.select(this).style('opacity', 1);
            d3.select(`#legend-${sanitize(d.data.name)}`).style('opacity', 1);
            tooltip.style('opacity', 1);
        })
        .on('mousemove', function(event: MouseEvent, d: D3PieArcDatum) {
            tooltip
              .html(`<b>${d.data.name}</b><br>${valueLabel}: <b>$${d.data.value.toLocaleString()}</b>`)
              .style('left', (event.pageX - element.getBoundingClientRect().left + 15) + 'px')
              .style('top', (event.pageY - element.getBoundingClientRect().top - 15) + 'px');
        })
        .on('mouseout', function(event: MouseEvent, d: D3PieArcDatum) {
            d3.select(this).style('opacity', 0.8);
            d3.select(`#legend-${sanitize(d.data.name)}`).style('opacity', 0.8);
            tooltip.style('opacity', 0);
        });
      
    const legendX = lang === 'ar' ? -radius - 40 : radius + 40;
    const legend = svg.append('g')
        .attr('transform', `translate(${legendX}, ${-height/2 + 60})`);

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .join('g')
        .attr('class', 'legend-item')
        .attr('id', (d: ChartData) => `legend-${sanitize(d.name)}`)
        .attr('transform', (d: ChartData, i: number) => `translate(0, ${i * 30})`)
        .style('opacity', 0.8)
        .style('cursor', 'default')
        .style('transition', 'opacity 0.2s ease-in-out')
        .on('mouseover', function(event: MouseEvent, d: ChartData) {
            d3.select(this).style('opacity', 1);
            d3.select(`#slice-${sanitize(d.name)}`).style('opacity', 1);
        })
        .on('mouseout', function(event: MouseEvent, d: ChartData) {
            d3.select(this).style('opacity', 0.8);
            d3.select(`#slice-${sanitize(d.name)}`).style('opacity', 0.8);
        });

    legendItems.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', (d: ChartData) => color(d.name) as string);

    legendItems.append('text')
      .attr('x', lang === 'ar' ? -24 : 24)
      .attr('y', 14)
      .text((d: ChartData) => d.name)
      .style('fill', '#e2e8f0')
      .style('font-size', '14px')
      .style('text-anchor', lang === 'ar' ? 'end' : 'start');
  }

  private createLineChart(): void {
    const data = this.getLineChartData();
    const element = this.lineChart()?.nativeElement;

    if (!element || element.clientWidth === 0) return;

    d3.select(element).select('svg').remove();
    d3.select(element).select('.d3-tooltip').remove();
    
    if (data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 70 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const defs = svg.append("defs");
    const lineGradient = defs.append("linearGradient")
        .attr("id", "line-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%");
    lineGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    lineGradient.append("stop").attr("offset", "100%").attr("stop-color", "#8b5cf6");

    const areaGradient = defs.append("linearGradient")
        .attr("id", "area-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "0%").attr("y2", "100%");
    areaGradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6").attr("stop-opacity", 0.3);
    areaGradient.append("stop").attr("offset", "100%").attr("stop-color", "#111827").attr("stop-opacity", 0);

    const x = d3.scaleBand()
      .domain(data.map((d: LineChartData) => d.month))
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: LineChartData) => d.value) * 1.1])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text').style('fill', '#94a3b8');
    svg.selectAll('.domain, .tick line').attr('stroke', '#374151');
      
    const yAxis = svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d: any) => `$${d / 1000}k`));
    yAxis.selectAll('text').style('fill', '#94a3b8');
    yAxis.select('.domain').remove();
    yAxis.selectAll('.tick line')
       .attr('stroke', '#374151')
       .attr('stroke-dasharray', '3,3')
       .attr('x2', width);

    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', d3.area()
        .x((d: any) => x(d.month)! + x.bandwidth()/2)
        .y0(height)
        .y1((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 3)
      .attr('d', d3.line()
        .x((d: any) => x(d.month)! + x.bandwidth()/2)
        .y((d: any) => y(d.value))
        .curve(d3.curveMonotoneX)
      );
    
    const tooltip = d3.select(element)
      .append('div')
      .attr('class', 'd3-tooltip absolute bg-slate-800 text-white text-sm rounded-lg py-1 px-3 shadow-lg pointer-events-none')
      .style('opacity', 0);
      
    const focus = svg.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('line')
      .attr('class', 'y-hover-line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('y1', 0)
      .attr('y2', height);

    focus.append('circle')
      .attr('r', 6)
      .attr('fill', '#8b5cf6')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => { focus.style('display', null); tooltip.style('opacity', 1); })
      .on('mouseout', () => { focus.style('display', 'none'); tooltip.style('opacity', 0); })
      .on('mousemove', mousemove);
      
    const xValues = data.map((d: LineChartData) => x(d.month)! + x.bandwidth() / 2);
    const bisect = d3.bisector((d: number) => d).left;

    function mousemove(event: MouseEvent) {
      const mouseX = d3.pointer(event)[0];
      const index = bisect(xValues, mouseX, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      
      const d = (d1 && (mouseX - xValues[index-1] > xValues[index] - mouseX)) ? d1 : d0;
      
      if (d) {
        const focusX = x(d.month)! + x.bandwidth() / 2;
        const focusY = y(d.value);
        
        focus.select('circle')
          .attr('cx', focusX)
          .attr('cy', focusY);
          
        focus.select('.y-hover-line')
          .attr('x1', focusX)
          .attr('x2', focusX);
          
        tooltip
          .html(`<b>${d.month}</b><br>$${d.value.toLocaleString()}`)
          .style('left', (focusX + margin.left + 15) + 'px')
          .style('top', (focusY + margin.top) + 'px');
      }
    }
  }
}
