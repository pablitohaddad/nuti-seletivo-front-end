import { useState } from "react";
import api from "./services/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { mask, unMask } from "remask";

function App() {
  const [form, setForm] = useState({ cnpj: "", dataInicial: "", dataFinal: "", numeroPaginas: 0 });
  const [data, setData] = useState<DadosContratos>({data:[], valorTotal:"", totalRegistros: 0});
  const [loading, setLoading] = useState(false);
  const formattedValueValorFinal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.valorTotal));

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function formatCNPJ(cnpj:string){
    const originalValue = unMask(cnpj)
    return mask(originalValue, ["999.999/9999-99"])
  }

  function formatDate(date: string): string {
    const [year, month, day] = date.split("-");
    return `${year}${month}${day}`;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const id = toast.loading("Aguarde um momento...")

    try {
      const formattedDataInicial = formatDate(form.dataInicial);
      const formattedDataFinal = formatDate(form.dataFinal);

      const queryParams = new URLSearchParams({
        dataInicial: formattedDataInicial,
        dataFinal: formattedDataFinal,
        pagina: "1",
        cnpjOrgao: form.cnpj
      }).toString();

      const url = `/contracts?${queryParams}`;

      const response = await api.get(url);
      const data: DadosContratos = response.data;

      setData(data);

      toast.update(id, {render:"Dados encontrados com sucesso", type:"success", autoClose:3000, isLoading:false})

    } catch (error: any) {
      if(error.response.status === 500){
        toast.update(id, {render:"A conexão com o banco de dados da PNCP falhou", type:"error", autoClose:3000, isLoading:false})
      }else{
        toast.update(id, {render:"Não foi possível encontrar os dados", type:"error", autoClose:3000, isLoading:false})
      }
    }finally{
      setLoading(false)
    }
  }

  function formatDateInResponse(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }
  return (
    <div className="mx-auto p-5 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-center text-gray-800 text-xl font-bold">Buscar contratos</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="text-lg text-gray-600 mb-1">CNPJ</label>
          <input
            onChange={handleChange}
            value={form.cnpj}
            type="text"
            name="cnpj"
            className="p-2 rounded border border-gray-300 text-lg"
            placeholder="Digite o CNPJ (Apenas números)"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-lg text-gray-600 mb-1">Data Inicial</label>
          <input
            onChange={handleChange}
            value={form.dataInicial}
            type="date"
            name="dataInicial"
            className="p-2 rounded border border-gray-300 text-lg"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-lg text-gray-600 mb-1">Data Final</label>
          <input
            onChange={handleChange}
            value={form.dataFinal}
            type="date"
            name="dataFinal"
            className="p-2 rounded border border-gray-300 text-lg"
          />
        </div>
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded cursor-pointer text-lg"
          disabled={loading}
        >
          Buscar
        </button>
        <ToastContainer />
      </form>
  
      {data && data.data && data.data.length > 0 && (
  <div className="w-full mt-5 p-4 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl text-center text-neutral mb-6 font-bold">Informações do Órgão</h2>
    <div className="gap-4 flex">
    <div className="items-baseline gap-4 flex mb-4">
      <h3 className="text-lg text-primary mb-1">Razão Social:</h3>
      <p className="text-base text-neutral">{data.data[0].orgaoEntidade.razaoSocial}</p>
    </div>
    <div className="items-baseline gap-4 flex mb-4">
      <h3 className="text-lg text-primary mb-1">CNPJ:</h3>
      <p className="text-base text-neutral">{formatCNPJ(data.data[0].orgaoEntidade.cnpj)}</p>
    </div>
    <div className="items-baseline gap-4 flex mb-4">
      <h3 className="text-lg text-primary mb-1">Esfera ID:</h3>
      <p className="text-base text-neutral">{data.data[0].orgaoEntidade.esferaId}</p>
    </div>
    <div className="items-baseline gap-4 flex mb-4">
      <h3 className="text-lg text-primary mb-1">Poder ID:</h3>
      <p className="text-base text-neutral">{data.data[0].orgaoEntidade.poderId}</p>
    </div>
    </div>

    <h2 className="text-2xl text-center text-neutral mb-6 font-bold">Contratos</h2>
    <div className="flex items-center mt-6">
      <div className="items-baseline gap-4 flex mb-4 mr-5">
        <h3 className="text-lg text-primary mb-1">Valor Total:</h3>
        <p className="text-base text-neutral">{formattedValueValorFinal}</p>
      </div>
      <div className="items-baseline gap-4 flex mb-4">
        <h3 className="text-lg text-primary mb-1">Total de Contratos:</h3>
        <p className="text-base text-neutral">{data.totalRegistros}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {data.data.map((contrato, index) => (
        <div key={index} className="border border-black p-4 bg-gray-50 rounded-md shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg text-primary mb-1">Objeto do Contrato:</h4>
            <p className="text-base text-neutral">{contrato.objetoContrato}</p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg text-primary mb-1">Razão Social do Fornecedor:</h4>
            <p className="text-base text-neutral">{contrato.nomeRazaoSocialFornecedor}</p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg text-primary mb-1">Data de Vigência Inicial:</h4>
            <p className="text-base text-neutral">{formatDateInResponse(contrato.dataVigenciaInicio)}</p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg text-primary mb-1">Data de Vigência Final:</h4>
            <p className="text-base text-neutral">{formatDateInResponse(contrato.dataVigenciaFim)}</p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg text-primary mb-1">Valor Inicial do Contrato:</h4>
            <p className="text-base text-neutral">
              {Number(contrato.valorInicial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      ))}
    </div>
    
  </div>
)}


    </div>
  );
}
export default App;