import { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import * as api from '../../services/api';
import { type DashboardStats } from '../../types';
import styles from './Dashboard.module.css';
import EvolutionChart from '../EvolutionChart';
import GameCard from './GameCard';
import ScheduledGameCard from './ScheduledGameCard';

const StatCard = ({ title, value, subtitle, variant }: { title: string, value: string, subtitle: string, variant: string }) => (
  <div className={`${styles.statCard} ${styles[variant]}`}>
    <h3>{title}</h3>
    <p>{value}</p>
    <span>{subtitle}</span>
  </div>
);

export default function Dashboard() {
  const { games, bets, loading: dataLoading, error: dataError, refetchData } = useData();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  
  const fetchStats = useCallback(async (filters: { market?: string } = {}) => {
    setStatsLoading(true);
    try {
        const statsData = await api.getDashboardStats(filters);
        setStats(statsData);
    } catch (error) { 
        console.error("Falha ao buscar estatísticas:", error);
    } finally { 
        setStatsLoading(false); 
    }
  }, []);

  // Função unificada para recarregar todos os dados da página
  const fetchAllDashboardData = useCallback(async (filters: { market?: string } = {}) => {
    await Promise.all([
        refetchData(filters),
        fetchStats(filters)
    ]);
  }, [refetchData, fetchStats]);

  useEffect(() => {
    fetchStats(); // Carga inicial apenas das estatísticas
  }, [fetchStats]);
  
  const handleMarketFilterChange = (market: string) => {
    const newFilters = { market: market };
    setMarketFilter(market);
    fetchAllDashboardData(newFilters);
  };
  
  const allMarkets = useMemo(() => {
    const markets = new Set(bets.map(b => b.market));
    return Array.from(markets).sort();
  }, [bets]);

  // Lógica para separar jogos agendados dos jogos com apostas
  const { scheduledGames, gamesWithBets } = useMemo(() => {
    const bettedGameIds = new Set(bets.map(b => b.game_id));
    const scheduled = games.filter(g => !bettedGameIds.has(g.id)).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const withBets = games.filter(g => bettedGameIds.has(g.id));
    return { scheduledGames: scheduled, gamesWithBets: withBets };
  }, [games, bets]);

  const filteredGamesWithBets = useMemo(() => {
    if (!filterDate) return gamesWithBets;
    return gamesWithBets.filter(game => game.start_time.startsWith(filterDate));
  }, [gamesWithBets, filterDate]);
  
  const getBetsForGame = (gameId: number) => bets.filter(bet => bet.game_id === gameId);
  
  if (dataLoading) return <p>Carregando dados da aplicação...</p>;
  if (dataError) return <p style={{ color: 'red' }}>{dataError}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Dashboard - Resumo da Banca</h2>
      {statsLoading ? <p>Calculando estatísticas...</p> : stats && (
        <div className={styles.statsGrid}>
          <StatCard title="Banca Total" value={stats.banca_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} subtitle={`Inicial: ${stats.banca_inicial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`} variant="banca" />
          <StatCard title="ROI" value={`${stats.roi.toFixed(2)}%`} subtitle="Retorno Sobre Investimento" variant="roi" />
          <StatCard title="Taxa de Acerto" value={`${stats.taxa_de_acerto.toFixed(2)}%`} subtitle={`${stats.apostas_vencidas} de ${stats.total_apostas} apostas`} variant="acerto" />
          <StatCard title="Lucro Total" value={stats.lucro_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} subtitle={`${stats.total_apostas} apostas no total`} variant="lucro" />
        </div>
      )}

      <div style={{ margin: '40px 0', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <EvolutionChart />
      </div>

      {/* Seção de Jogos Agendados */}
      <div className="scheduled-games-section">
        <h3 style={{ borderBottom: '2px solid #ffa000', paddingBottom: '8px' }}>
          Jogos Agendados (Aguardando Aposta)
        </h3>
        {scheduledGames.length > 0 ? (
          scheduledGames.map(game => (
            <ScheduledGameCard key={game.id} game={game} onBetPlaced={() => fetchAllDashboardData({ market: marketFilter })} />
          ))
        ) : (
          <p style={{ fontStyle: 'italic', color: '#666' }}>Nenhum jogo novo agendado.</p>
        )}
      </div>

      <hr style={{margin: '40px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      {/* Seção do Histórico de Apostas */}
      <div className="games-with-bets-section">
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '8px' }}>
          Histórico de Apostas
        </h3>
        <div style={{ display: 'flex', gap: '20px', margin: '24px 0', alignItems: 'center' }}>
            <div>
              <label style={{ marginRight: '8px', fontWeight: 500 }}>Filtrar por Mercado:</label>
              <select value={marketFilter} onChange={e => handleMarketFilterChange(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="">Todos os Mercados</option>
                  {allMarkets.map(market => <option key={market} value={market}>{market}</option>)}
              </select>
            </div>
            <div>
              <label style={{ marginRight: '8px', fontWeight: 500 }}>Filtrar por Data:</label>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}/>
            </div>
        </div>
        
        <div>
          {filteredGamesWithBets.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#666' }}>Nenhum jogo com aposta encontrada para os filtros selecionados.</p>
          ) : (
            filteredGamesWithBets.map(game => (
              <GameCard 
                key={game.id}
                game={game}
                bets={getBetsForGame(game.id)}
                onDataUpdate={() => fetchAllDashboardData({ market: marketFilter })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}