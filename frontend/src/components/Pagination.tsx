type PaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null; // Não mostra a paginação se houver apenas uma página
  }

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
      <button onClick={handlePrev} disabled={currentPage === 1}>
        Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button onClick={handleNext} disabled={currentPage === totalPages}>
        Próxima
      </button>
    </div>
  );
};

export default Pagination;