package com.myorg;

import software.amazon.awscdk.services.lambda.IFunction;

public interface HitCounterProps {
    // Public constructor for the props builder
    public static Builder builder() {
        return new Builder();
    }

    // The function for which we want to count url hits
    IFunction getDownstream();

    Number getReadCapacity();

    // The builder for the props interface
    public static class Builder {
        private IFunction downstream;
        private Number readCapacity;

        public Builder downstream(final IFunction function) {
            this.downstream = function;
            return this;
        }

        public Builder readCapacity(final Number readCapacity) {
          this.readCapacity = readCapacity;
          return this;
        }

        public HitCounterProps build() {
            if(this.downstream == null) {
                throw new NullPointerException("The downstream property is required!");
            }

            return new HitCounterProps() {
                @Override
                public IFunction getDownstream() {
                    return downstream;
                }

                @Override
                public Number getReadCapacity() {
                  return readCapacity;
                }
            };
        }
    }
}
