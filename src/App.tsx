import { useState } from "react";
import api from "./services/api";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [form, setForm] = useState({ cnpj: "", dataInicial: "", dataFinal: "", numeroPaginas: 0 });
  const [data, setData] = useState<DadosContratos>({data:[], valorTotal:"", totalRegistros: 0});
  const [loading, setLoading] = useState(false);
  const formattedValueValorFinal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.valorTotal));

  const notify = () => toast.info('Aguarde, a requisição está sendo feita', {
    position: "top-right",
    autoClose: 7000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  });

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function formatDate(date: string): string {
    const [year, month, day] = date.split("-");
    return `${year}${month}${day}`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);


    try {
      const formattedDataInicial = formatDate(form.dataInicial);
      const formattedDataFinal = formatDate(form.dataFinal);

      const queryParams = new URLSearchParams({
        dataInicial: formattedDataInicial,
        dataFinal: formattedDataFinal,
        pagina: form.numeroPaginas.toString(),
        cnpjOrgao: form.cnpj
      }).toString();

      const url = `/contracts?${queryParams}`;

      const response = await api.get(url);
      const data: DadosContratos = response.data;

      setData(data);

    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDateInResponse(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }

  function formatCNPJ(cnpj: string) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  
  

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Buscar contratos</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>CNPJ</label>
          <input
            onChange={handleChange}
            value={form.cnpj}
            type="text"
            name="cnpj"
            style={styles.input}
            placeholder="Digite o CNPJ"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Data Inicial</label>
          <input
            onChange={handleChange}
            value={form.dataInicial}
            type="date"
            name="dataInicial"
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Data Final</label>
          <input
            onChange={handleChange}
            value={form.dataFinal}
            type="date"
            name="dataFinal"
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Número de páginas</label>
          <input
            onChange={handleChange}
            value={form.numeroPaginas}
            type="number"
            name="numeroPaginas"
            style={styles.input}
            placeholder="Digite o número de páginas"
          />
        </div>
        <button onClick={notify} type="submit" style={styles.button} disabled={loading}>
          {loading ? "Carregando..." : "Buscar"}
        </button>
        <ToastContainer />
      </form>
  
      {data && data.data && data.data.length > 0 && (
        <div style={styles.results}>
          <h2 style={{ ...styles.subtitle, textAlign: 'center' }}>Informações do Órgão</h2>
          <div style={styles.resultItem}>
            <h3 style={styles.resultTitle}>Razão Social:</h3>
            <p style={styles.resultText}>{data.data[0].orgaoEntidade.razaoSocial}</p>
          </div>
          <div style={styles.resultItem}>
            <h3 style={styles.resultTitle}>CNPJ:</h3>
            <p style={styles.resultText}>{formatCNPJ(data.data[0].orgaoEntidade.cnpj)}</p>
          </div>
          <div style={styles.resultItem}>
            <h3 style={styles.resultTitle}>Esfera ID:</h3>
            <p style={styles.resultText}>{data.data[0].orgaoEntidade.esferaId}</p>
          </div>
          <div style={styles.resultItem}>
            <h3 style={styles.resultTitle}>Poder ID:</h3>
            <p style={styles.resultText}>{data.data[0].orgaoEntidade.poderId}</p>
          </div>
  
          <h2 style={{ ...styles.subtitle, textAlign: 'center' }}>Contratos</h2>
          {data.data.map((contrato, index) => (
            <div key={index} style={styles.contractItem}>
              <div style={styles.contractDetail}>
                <h4 style={styles.resultTitle}>Objeto do Contrato:</h4>
                <p style={styles.resultText}>{contrato.objetoContrato}</p>
              </div>
              <div style={styles.contractDetail}>
                <h4 style={styles.resultTitle}>Razão Social do Fornecedor:</h4>
                <p style={styles.resultText}>{contrato.nomeRazaoSocialFornecedor}</p>
              </div>
              <div style={styles.contractDetail}>
                <h4 style={styles.resultTitle}>Data de Vigência Inicial:</h4>
                <p style={styles.resultText}>{formatDateInResponse(contrato.dataVigenciaInicio)}</p>
              </div>
              <div style={styles.contractDetail}>
                <h4 style={styles.resultTitle}>Data de Vigência Final:</h4>
                <p style={styles.resultText}>{formatDateInResponse(contrato.dataVigenciaFim)}</p>
              </div>
              <div style={styles.contractDetail}>
                <h4 style={styles.resultTitle}>Valor Inicial do Contrato:</h4>
                <p style={styles.resultText}>
                  {Number(contrato.valorInicial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '20px' }}>
              <h3 style={styles.resultTitle}>Valor Total:</h3>
              <p style={styles.resultText}>{formattedValueValorFinal}</p>
            </div>
            <div>
              <h3 style={styles.resultTitle}>Total de Contratos:</h3>
              <p style={styles.resultText}>{data.totalRegistros}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    borderRadius: "8px",
    boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center" as const,
    color: "#333",
  },
  form: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "15px",
  },
  formGroup: {
    display: "flex" as const,
    flexDirection: "column" as const,
  },
  label: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px"
  },
  results: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  },
  subtitle: {
    fontSize: "20px",
    color: "#333",
    marginBottom: "15px",
  },
  resultItem: {
    marginBottom: "10px",
  },
  contractItem: {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "5px",
    boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.1)",
  },
  contractDetail: {
    marginBottom: "10px",
  },
  resultTitle: {
    fontSize: "16px",
    color: "#007BFF",
    marginBottom: "5px",
  },
  resultText: {
    fontSize: "16px",
    color: "#333",
  },
};

export default App;