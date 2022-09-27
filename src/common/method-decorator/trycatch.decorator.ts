export function TryCatch(errorMsg?: string) {

    return function (target: any, key: string, desc: PropertyDescriptor) {        
        const origin = desc.value;

        desc.value = async function (...args: any[]) {
            try {
                return await origin.apply(this, args);
            } catch ( error ) {
                console.log(error);
                // throw new Error(errorMsg + error.message);
                return Error(errorMsg + error.message);
            }
        };
    };
}

