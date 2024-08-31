import { useState } from "react"
import api from "./services/api";


function App() {
  const [form, setForm] = useState({ cnpj: "", dataInicial: "", dataFinal: "", numeroPaginas: 0 });

  const [data, setData] = useState<DadosContratos>({data:[], valorTotal:""})

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      // Monta a URL com os query params
      const queryParams = new URLSearchParams({
        dataInicial: form.dataInicial,
        dataFinal: form.dataFinal,
        pagina: form.numeroPaginas.toString(),
        cnpjOrgao: form.cnpj
      }).toString();

      const url = `/contracts?${queryParams}`;

      // Fazer a requisição para a API
      const response = await api.get(url);
      const data:DadosContratos = response.data;

      setData(data)

    } catch (error) {
      console.error("Erro ao buscar contratos:", error);
    }
  }

  return (
    <>
      <h1>Buscar contratos</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <h3>CNPJ</h3>
          <input onChange={handleChange} value={form.cnpj} type="text" name="cnpj" />
        </div>
        <div>
          <h3>Data Inicial</h3>
          <input onChange={handleChange} value={form.dataInicial} type="text" name="dataInicial" />
        </div>
        <div>
          <h3>Data Final</h3>
          <input onChange={handleChange} value={form.dataFinal} type="text" name="dataFinal" />
        </div>
        <div>
          <h3>Número de páginas</h3>
          <input onChange={handleChange} value={form.numeroPaginas} type="number" name="numeroPaginas" />
        </div>
        <button type="submit">Buscar</button>
      </form>
      <div>
        <h1>Razão Social: {data.data[0]?.orgaoEntidade.razaoSocial}</h1>
      </div>
      <div>
        <h1>Cnpj: {data.data[0]?.orgaoEntidade.cnpj}</h1>
      </div>
      <div>
        <h1>Esfera ID: {data.data[0]?.orgaoEntidade.esferaId}</h1>
      </div>
      <div>
        <h1>Poder ID: {data.data[0]?.orgaoEntidade.poderId}</h1>
      </div>
    </>
  );
}

export default App;