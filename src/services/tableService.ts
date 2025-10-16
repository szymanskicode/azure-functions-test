import * as azure from "azure-storage";

const tableService = azure.createTableService(
  process.env.AZURE_STORAGE_ACCOUNT,
  process.env.AZURE_STORAGE_ACCESS_KEY
);

const insertEntity = (tableName: string, entity: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    tableService.insertEntity(
      tableName,
      entity,
      { echoContent: true, payloadFormat: "application/json;odata=nometadata" },
      (error: any, result: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.body);
        }
      }
    );
  });
};

const queryEntities = (tableName: string, query: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    tableService.queryEntities(
      tableName,
      query,
      null,
      { payloadFormat: "application/json;odata=nometadata" },
      (error: any, result: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response.body);
        }
      }
    );
  });
};

const updateEntity = (tableName: string, entity: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    tableService.mergeEntity(tableName, entity, (error: any) => {
      if (error) {
        reject(error);
      } else {
        // After updating, retrieve the updated entity
        tableService.retrieveEntity(
          tableName,
          entity.PartitionKey._,
          entity.RowKey._,
          { payloadFormat: "application/json;odata=nometadata" },
          (retrieveError: any, _retrieveResult: any, retrieveResponse: any) => {
            if (retrieveError) {
              reject(retrieveError);
            } else {
              resolve(retrieveResponse.body);
            }
          }
        );
      }
    });
  });
};

const retrieveEntity = (
  tableName: string,
  partitionKey: string,
  rowKey: string
): Promise<any | null> => {
  return new Promise((resolve, reject) => {
    tableService.retrieveEntity(
      tableName,
      partitionKey,
      rowKey,
      { payloadFormat: "application/json;odata=nometadata" },
      (error: any, _result: any, response: any) => {
        if (error) {
          if (error.statusCode === 404) {
            resolve(null);
          } else {
            reject(error);
          }
        } else {
          resolve(response.body);
        }
      }
    );
  });
};

const deleteEntity = (tableName: string, entity: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    tableService.deleteEntity(tableName, entity, (error: any) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export { insertEntity, queryEntities, updateEntity, retrieveEntity, deleteEntity };
