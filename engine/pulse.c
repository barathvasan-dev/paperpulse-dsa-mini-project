/* The browser supplies normalized token IDs and validated integer metadata.
   Each posting links a question to a token in a chained hash index. */
#define MAX_Q 600
#define WORDS 128
#define BUCKETS 32771
typedef struct { int token, question, next; } Posting;
static Posting postings[MAX_Q * WORDS];
static int heads[BUCKETS], tokens[MAX_Q][WORDS], lengths[MAX_Q];
static int papers[MAX_Q], marks[MAX_Q], parent[MAX_Q], size[MAX_Q];
static int frequency[MAX_Q], total[MAX_Q], order[MAX_Q];
static int count, threshold, posting_count;
static unsigned seed;
void reset(int minimum, unsigned random_seed) {
    count = posting_count = 0;
    threshold = minimum;
    seed = random_seed | 1;
    for (int i=0;i<BUCKETS;i++) heads[i]=-1;
}
int *input(int paper, int mark, int length) {
    if(count>=MAX_Q || length<0 || length>WORDS) return 0;
    int i=count++;
    papers[i]=paper; marks[i]=mark; lengths[i]=length;
    parent[i]=i; size[i]=1; frequency[i]=total[i]=0;
    return tokens[i];
}
static int root(int x) {
    while(parent[x]!=x) {parent[x]=parent[parent[x]]; x=parent[x];}
    return x;
}
static void unite(int a,int b) {
    a=root(a); b=root(b);
    if(a==b) return;
    if(size[a]<size[b]) {int t=a;a=b;b=t;}
    parent[b]=a; size[a]+=size[b];
}
static int matches(int a,int b) {
    int n=lengths[a], m=lengths[b], dp[WORDS+1]={0};
    if(200*(n<m?n:m)<threshold*(n+m)) return 0;
    for(int i=0;i<n;i++){
        int diagonal=0;
        for(int j=1;j<=m;j++){
            int previous=dp[j];
            if(tokens[a][i]==tokens[b][j-1]) dp[j]=diagonal+1;
            else if(dp[j-1]>dp[j]) dp[j]=dp[j-1];
            diagonal=previous;
        }
    }
    return 200*dp[m]>=threshold*(n+m);
}
static int before(int a,int b) {
    if(frequency[a]!=frequency[b]) return frequency[a]>frequency[b];
    if(total[a]!=total[b]) return total[a]>total[b];
    return a<b;
}
static void sort(int lo,int hi) {
    if(lo>=hi) return;
    seed=1664525u*seed+1013904223u;
    int pivot=order[lo+seed%(hi-lo+1)], i=lo,j=hi;
    while(i<=j){
        while(before(order[i],pivot)) i++;
        while(before(pivot,order[j])) j--;
        if(i<=j){int t=order[i];order[i++]=order[j];order[j--]=t;}
    }
    sort(lo,j);sort(i,hi);
}
int analyze(void) {
    int groups=0;
    for(int i=0;i<count;i++){
        char seen[MAX_Q]={0};
        for(int j=0;j<lengths[i];j++){
            int token=tokens[i][j], bucket=(unsigned)token%BUCKETS;
            for(int k=heads[bucket];k>=0;k=postings[k].next){
                int other=postings[k].question;
                if(postings[k].token!=token || seen[other]) continue;
                seen[other]=1;
                if(root(i)!=root(other) && matches(i,other)) unite(i,other);
            }
        }
        for(int j=0;j<lengths[i];j++){
            int token=tokens[i][j], bucket=(unsigned)token%BUCKETS;
            postings[posting_count]=(Posting){token,i,heads[bucket]};
            heads[bucket]=posting_count++;
        }
    }
    for(int i=0;i<count;i++){
        int r=root(i), first=1;
        for(int j=0;j<i;j++) if(root(j)==r && papers[j]==papers[i]) {first=0;break;}
        frequency[r]+=first;total[r]+=marks[i];
        if(i==r) order[groups++]=r;
    }
    sort(0,groups-1);
    return groups;
}
int ranked(int i){return order[i];}
int group(int i){return root(i);}
int coverage(int r){return frequency[r];}
int score(int r){return total[r];}

