export class StreamReader
{
    private current: string = "";
    
    constructor(private terminator: string, private onData: (data: string) => any)
    {

    }

    public readChunk = (data: string) =>
    {
        this.current += data;
        const index = this.current.indexOf(this.terminator);

        if (index !== -1)
        {
            this.onData(this.current.substr(0, index));
            this.current = this.current.substr(index + this.terminator.length);
        }
    }
}