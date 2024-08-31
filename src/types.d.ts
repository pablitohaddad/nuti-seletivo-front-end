type FormType = {
    cnpj:string
    dataInicial:string
    dataFinal:string
    numeroPaginas:number
}
type OrgaoEntidade = {
    id: number;
    cnpj: string;
    esferaId: string;
    razaoSocial: string;
    poderId: string;
};

type Contrato = {
    orgaoEntidade: OrgaoEntidade;
    dataVigenciaInicio: string;
    dataVigenciaFim: string;
    objetoContrato: string;
    valorInicial: string;
};

type DadosContratos = {
    data: Contrato[];
    valorTotal: string;
};