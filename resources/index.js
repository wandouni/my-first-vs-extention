(() => {
  const vscode = acquireVsCodeApi();

  document.querySelector('.table-button').addEventListener('click', (e) => {
    const value = createTableOutput();
    postMessage('showColumnsCopyedInfo', value);
  });

  document.querySelector('.cursor-button').addEventListener('click', (e) => {
    const value = createTableOutput();
    postMessage('insertIntoCursorCurrent', value);
  });

  function createTableOutput() {
    // const testCode = `{
    //   /** 记录ID */
    //   collectId?: string;
    //   /** 枚举定义为：[{"id":0,"text":"dt文件"},{"id":1,"text":"数据库"}]; ,可用值:0,1 */
    //   collectType?: number;
    //   /** 设备名称 */
    //   deviceName?: string;
    //   /** 设备ID */
    //   subDeviceList?: {
    //     /** 子设备名称 */
    //     name?: string;
    //     /** 子设备ID */
    //     subDeviceId?: string;
    //   }[];
    //   /** 枚举定义为：[{"id":0,"text":"线路"},{"id":1,"text":"电厂"}]; ,可用值:0,1 */
    //   subDeviceType?: number;
    //   [key: string]: any;
    // }`;

    //   const testCode = `{
    //     lineId: string; // 线路ID
    //     name: string; // 线路名称
    //     tvDeviationRate: number[]; // 偏差率
    //     tvLimit: number[]; // 线路极限
    //     tvLoadRate: number[]; // 负载率
    //     tvPlanFlow: number[]; // 计划潮流
    //     tvRealFlow: number[]; // 实际潮流
    //     tvSubtracted: number[]; // 差值
    //     tvTsLimit: number[]; // 线路热稳极限
    //     [key: string]: any;
    // }`;
    const testCode = document.querySelector('.table-input').value;
    const isNormalType = testCode?.includes('//');
    const inputStrSplits = testCode.split(
      isNormalType ? /\n/ : /(;\n|\{\n|\[\n)/,
    );
    console.log('inputStrSplits: ', inputStrSplits);

    const columns = [];

    inputStrSplits.forEach((inputStrSplit) => {
      if (
        !inputStrSplit.includes('[key: string]: any') &&
        !inputStrSplit.includes('[key:string]:any') &&
        inputStrSplit !== '{' &&
        inputStrSplit !== '}'
      ) {
        const matchArr = inputStrSplit.match(
          /[A-Za-z0-9]+[?]{0,1}[:]{1}[\s]*(string|boolean|number){0,1}/,
        );
        if (matchArr) {
          const propertyAnnotation =
            inputStrSplit
              ?.match(
                isNormalType
                  ? /(?<=\/\/\s).*/
                  : /(?<=[\s]*\/\*\*[\s]*).*(?=[\s]*\*\/)/,
              )?.[0]
              ?.trim() ?? '';
          const propertyName = matchArr?.[0].match(
            /[A-Za-z0-9]+(?=[?]{0,1}:)/,
          )?.[0];
          if (propertyName) {
            columns.push({
              title: propertyAnnotation,
              dataIndex: propertyName,
            });
          }
        }
      }
    });

    console.log('columns', columns);
    document.querySelector('.table-output').value = JSON.stringify(columns);
    document.querySelector('.table-output').select();
    document.execCommand('copy');
    return JSON.stringify(columns);
  }

  function postMessage(type, value) {
    vscode.postMessage({
      type,
      value,
    });
  }
})();
