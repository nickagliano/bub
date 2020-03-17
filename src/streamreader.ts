export class StreamReader
{
    private current: string = "";
    
    constructor(private terminator: string, private onData: (data: string) => any)
    {

    }

    public readChunk = (dataBuffer: Buffer) =>
    {
        const data = dataBuffer.toString();
        this.current += data;
        let index = this.current.indexOf(this.terminator);

        while (index !== -1)
        {
            this.onData(this.current.substr(0, index));
            this.current = this.current.substr(index + this.terminator.length);
            index = this.current.indexOf(this.terminator);
        }
    }
}