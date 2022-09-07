export function TryCatch(errorMsg?: string) {
    return function (target: any, key: string, desc: PropertyDescriptor) {
        const origin = desc.value;
        desc.value = async function (...args: any[]) {
            try {
                return await origin.apply(this, args);
            } catch (e) {
                console.log(e);
                return { ok: false, error: errorMsg + e.message };
            }
        };
    };
}



