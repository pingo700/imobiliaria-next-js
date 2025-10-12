import { IImovelRepository } from '../domain/repositories/IImovelRepository';
import { CreateImovel } from '../domain/use-cases/CreateImovel';
import { UpdateImovel } from '../domain/use-cases/UpdateImovel';
import { DeleteImovel, HardDeleteImovel } from '../domain/use-cases/DeleteImovel';
import { FindImovel, FindImovelByCodigo, FindImovelBySlug } from '../domain/use-cases/FindImovel';
import { ListImoveis, ListImoveisByBairro, ListImoveisByCategoria } from '../domain/use-cases/ListImoveis';
import { SearchImoveis } from '../domain/use-cases/SearchImoveis';
import { GetImovelStatistics, GetBairroStatistics } from '../domain/use-cases/ImovelStatistics';
import { ExportImoveis, ImportImoveis } from '../domain/use-cases/ExportImoveis';
import { ValidateImovelData, ValidateBusinessRules } from '../domain/use-cases/ValidateImovel';
import { MockImovelRepository } from '../infra/mocks/MockImovelRepository';

export function makeImovelUseCases() {
  const imovelRepository: IImovelRepository = MockImovelRepository.getInstance();

  // CRUD Operations
  const createImovel = new CreateImovel(imovelRepository);
  const updateImovel = new UpdateImovel(imovelRepository);
  const deleteImovel = new DeleteImovel(imovelRepository);
  const hardDeleteImovel = new HardDeleteImovel(imovelRepository);

  // Find Operations
  const findImovel = new FindImovel(imovelRepository);
  const findImovelByCodigo = new FindImovelByCodigo(imovelRepository);
  const findImovelBySlug = new FindImovelBySlug(imovelRepository);

  // List Operations
  const listImoveis = new ListImoveis(imovelRepository);
  const listImoveisByBairro = new ListImoveisByBairro(imovelRepository);
  const listImoveisByCategoria = new ListImoveisByCategoria(imovelRepository);

  // Search Operations
  const searchImoveis = new SearchImoveis(imovelRepository);

  // Statistics
  const getImovelStatistics = new GetImovelStatistics(imovelRepository);
  const getBairroStatistics = new GetBairroStatistics(imovelRepository);

  // Import/Export
  const exportImoveis = new ExportImoveis(imovelRepository);
  const importImoveis = new ImportImoveis(imovelRepository);

  // Validation
  const validateImovelData = new ValidateImovelData();
  const validateBusinessRules = new ValidateBusinessRules();

  return {
    // CRUD
    createImovel,
    updateImovel,
    deleteImovel,
    hardDeleteImovel,

    // Find
    findImovel,
    findImovelByCodigo,
    findImovelBySlug,

    // List
    listImoveis,
    listImoveisByBairro,
    listImoveisByCategoria,

    // Search
    searchImoveis,

    // Statistics
    getImovelStatistics,
    getBairroStatistics,

    // Import/Export
    exportImoveis,
    importImoveis,

    // Validation
    validateImovelData,
    validateBusinessRules,
  };
}