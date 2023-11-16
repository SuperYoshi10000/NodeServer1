export async function callback<T>(
    action: (resolve: (value: T) => void, reject: (reason?: any) => void) => void
): Promise<T> {
    return await new Promise((resolve: (value: T) => void, reject: (reason?: any) => void) => {
        action(resolve, reject);
    });
}