export function fillArray(value: any, size: number)
{
    const ret = new Array(size);
    for (let i = 0; i < size; i++)
    {
        ret[i] = value;
    }

    return ret;
}